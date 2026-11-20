import type {
  AIEquipment,
  EquipmentComparisonResult,
} from "./types";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function findSharedValues(
  first: string[],
  second: string[]
) {
  return first.filter((value) =>
    second.some(
      (otherValue) =>
        normalize(otherValue) === normalize(value)
    )
  );
}

function findUniqueValues(
  source: string[],
  other: string[]
) {
  return source.filter(
    (value) =>
      !other.some(
        (otherValue) =>
          normalize(otherValue) === normalize(value)
      )
  );
}

export function compareEquipmentFacts(
  equipmentA: AIEquipment,
  equipmentB: AIEquipment
): EquipmentComparisonResult {
  const priceDifference = Math.abs(
    equipmentA.rentalPrice -
      equipmentB.rentalPrice
  );

  let cheaperEquipmentId: string | null = null;

  if (
    equipmentA.rentalPrice <
    equipmentB.rentalPrice
  ) {
    cheaperEquipmentId = equipmentA.id;
  } else if (
    equipmentB.rentalPrice <
    equipmentA.rentalPrice
  ) {
    cheaperEquipmentId = equipmentB.id;
  }

  let horsepowerDifference: number | null =
    null;

  let higherHorsepowerEquipmentId:
    | string
    | null = null;

  if (
    equipmentA.horsepower !== null &&
    equipmentB.horsepower !== null
  ) {
    horsepowerDifference = Math.abs(
      equipmentA.horsepower -
        equipmentB.horsepower
    );

    if (
      equipmentA.horsepower >
      equipmentB.horsepower
    ) {
      higherHorsepowerEquipmentId =
        equipmentA.id;
    } else if (
      equipmentB.horsepower >
      equipmentA.horsepower
    ) {
      higherHorsepowerEquipmentId =
        equipmentB.id;
    }
  }

  return {
    equipmentA,
    equipmentB,

    analysis: {
      cheaperEquipmentId,
      priceDifference,

      higherHorsepowerEquipmentId,
      horsepowerDifference,

      sameCategory:
        equipmentA.category !== null &&
        equipmentB.category !== null &&
        normalize(equipmentA.category) ===
          normalize(equipmentB.category),

      sameLocation:
        normalize(equipmentA.location) ===
        normalize(equipmentB.location),

      sharedCrops: findSharedValues(
        equipmentA.supportedCrops,
        equipmentB.supportedCrops
      ),

      onlyEquipmentACrops: findUniqueValues(
        equipmentA.supportedCrops,
        equipmentB.supportedCrops
      ),

      onlyEquipmentBCrops: findUniqueValues(
        equipmentB.supportedCrops,
        equipmentA.supportedCrops
      ),

      sharedActivities: findSharedValues(
        equipmentA.supportedActivities,
        equipmentB.supportedActivities
      ),

      onlyEquipmentAActivities:
        findUniqueValues(
          equipmentA.supportedActivities,
          equipmentB.supportedActivities
        ),

      onlyEquipmentBActivities:
        findUniqueValues(
          equipmentB.supportedActivities,
          equipmentA.supportedActivities
        ),
    },
  };
}