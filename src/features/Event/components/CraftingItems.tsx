import React, { useContext, useState } from "react";
import { useActor } from "@xstate/react";
import classNames from "classnames";
import Decimal from "decimal.js-light";

import token from "assets/icons/token.gif";

import { Box } from "components/ui/Box";
import { OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { ToastContext } from "features/game/toast/ToastQueueProvider";
import { Context } from "features/game/GameProvider";
import { ITEM_DETAILS } from "features/game/types/images";
import { Craftable } from "features/game/types/craftables";
import { InventoryItemName } from "features/game/types/game";

interface Props {
  items: Partial<Record<InventoryItemName, Craftable>>;
  isBulk?: boolean;
  onClose: () => void;
}

export const CraftingItems: React.FC<Props> = ({
  items,
  onClose,
  isBulk = false,
}) => {
  const [selected, setSelected] = useState<Craftable>(Object.values(items)[0]);
  const { setToast } = useContext(ToastContext);
  const { gameService, shortcutItem } = useContext(Context);
  const [
    {
      context: { state },
    },
  ] = useActor(gameService);
  const inventory = state.inventory;

  const lessIngredients = (amount = 1) =>
    selected.ingredients.some((ingredient) =>
      ingredient.amount.mul(amount).greaterThan(inventory[ingredient.item] || 0)
    );
  const lessFunds = (amount = 1) =>
    state.balance.lessThan(selected.price.mul(amount));

  const craft = (amount = 1) => {
    gameService.send("item.crafted", {
      item: selected.name,
      amount,
    });
    setToast({ content: "SFL -$" + selected.price.mul(amount) });
    selected.ingredients.map((ingredient, index) => {
      setToast({
        content:
          "Item " + ingredient.item + " -" + ingredient.amount.mul(amount),
      });
    });

    shortcutItem(selected.name);
  };

  const restock = () => {
    gameService.send("SYNC");

    onClose();
  };

  const soldOut = selected.supply === 0;

  const Action = () => {
    if (soldOut) {
      return null;
    }

    if (selected.disabled) {
      return <span className="text-xs mt-1 text-shadow">Locked</span>;
    }

    if (stock?.equals(0)) {
      return (
        <div>
          <p className="text-xxs no-wrap text-center my-1 underline">
            Sold out
          </p>
          <p className="text-xxs text-center">
            Sync your farm to the Blockchain to restock
          </p>
          <Button className="text-xs mt-1" onClick={restock}>
            Sync
          </Button>
        </div>
      );
    }

    return (
      <>
        <Button
          disabled={lessFunds() || lessIngredients() || stock?.lessThan(1)}
          className="text-xs mt-1"
          onClick={() => craft()}
        >
          Craft {isBulk && "1"}
        </Button>
       
      </>
    );
  };

  const stock = state.stock[selected.name] || new Decimal(20);
  const classes = "perkBox"

  return ( 
    <div className="flex">
      <div className="w-3/5 flex flex-wrap h-fit">
        <div className="flex flex-wrap bg-red-400 justify-center align-center">
        {Object.values(items).map((item) => (
          <Box
            isSelected={selected.name === item.name}
            key={item.name}
            onClick={() => setSelected(item)}
            image={ITEM_DETAILS[item.name].image}
            count={inventory[item.name]}
            
          />
        ))}
        </div>
        <div className="mt-5  border-t border-white  ">
          
           Wisdomy quote from the crop sage 
        </div>
      </div>
      <OuterPanel className="flex-1 w-1/3">
        <div className="flex flex-col justify-center items-center p-2 relative">
          <span className="bg-blue-600 text-shadow border  text-xxs absolute left-0 -top-4 p-1 rounded-md">
            {`${stock} in stock`}
          </span>
          {soldOut && (
            <span className="bg-red-800 text-shadow border text-xxs absolute left-0 -top-4 p-1 rounded-md">
              Sold out
            </span>
          )}
          {!!selected.supply && (
            <span className="bg-blue-600 text-shadow border text-xxs absolute left-0 -top-4 p-1   rounded-md">
              {`${selected.supply} left`}
            </span>
          )}

          <span className="text-shadow text-center">{selected.name}</span>
          <img
            src={ITEM_DETAILS[selected.name].image}
            className="h-16 img-highlight mt-1"
            alt={selected.name}
          />
          <span className="text-shadow text-center mt-2 sm:text-sm">
            {selected.description}
          </span>
          <div className="border-t border-white w-full mt-2 pt-1">
            {selected.ingredients.map((ingredient, index) => {
              const item = ITEM_DETAILS[ingredient.item];
              const lessIngredient = new Decimal(
                inventory[ingredient.item] || 0
              ).lessThan(ingredient.amount);

              return (
                <div className="flex justify-center items-end" key={index}>
                  <img src={item.image} className="h-5 me-2" />
                  <span
                    className={classNames(
                      "text-xs text-shadow text-center mt-2 ",
                      {
                        "text-red-500": lessIngredient,
                      }
                    )}
                  >
                    {ingredient.amount.toNumber()} 
                  </span>
                </div>
              );
            })}

            <div className="flex justify-center items-end">
              <img src={token} className="h-5 mr-1" />
              <span
                className={classNames("text-xs text-shadow text-center mt-2 ", {
                  "text-red-500": lessFunds(),
                })}
              >
                {`$${selected.price.toNumber()}`}
              </span>
            </div>
          </div>
          {Action()}
        </div>
      </OuterPanel>
    </div>
  );
};
