import React, { useContext, useEffect } from "react";
import { useActor } from "@xstate/react";
import { Modal } from "react-bootstrap";
import classNames from "classnames";

import { Context } from "features/game/GameProvider";

import market from "assets/buildings/market_building.png";
import plant from "assets/icons/plant.png";

import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Action } from "components/ui/Action";

import { MarketItems } from "./MarketItems";
import { useTour } from "@reactour/tour";
import { TourStep } from "features/game/lib/Tour";
import { Section } from "lib/utils/useScrollIntoView";

export const Market: React.FC = () => {
  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);
  const [isOpen, setIsOpen] = React.useState(false);

  const isNotReadOnly = !gameState.matches("readonly");
  const {
    setCurrentStep: setCurrentTourStep,
    isOpen: tourIsOpen,
    currentStep: currentTourStep,
  } = useTour();

  const handleMarketClick = () => {
    setIsOpen(true);
    if (tourIsOpen && currentTourStep === TourStep.openShop) {
      setTimeout(() => {
        setCurrentTourStep(TourStep.openSellTab);
      }, 300);
    }
  };

  return (
    <div
      id={Section.Shop}
      className="absolute"
      style={{
        width: `${GRID_WIDTH_PX * 3}px`,
        left: `${GRID_WIDTH_PX * 3}px`,
        top: `${GRID_WIDTH_PX * 5}px`,
      }}
    >
      <img
        src={market}
        alt="market"
        onClick={isNotReadOnly ? () => handleMarketClick() : undefined}
        className={classNames(" w-full", {
          "cursor-pointer": isNotReadOnly,
          "hover:img-highlight": isNotReadOnly,
        })}
      />
      {isNotReadOnly && (
        <Action
          className="absolute top-5 left-4"
          text="Shop"
          icon={plant}
          onClick={() => handleMarketClick()}
        />
      )}
      <Modal
        centered
        show={isOpen}
        onHide={tourIsOpen ? undefined : () => setIsOpen(false)}
      >
        <MarketItems onClose={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
};
