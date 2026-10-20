import type { ComponentType, SVGProps } from "react";
import { FieldIcon, HouseIcon, PlotIcon, ShopIcon, TreeIcon } from "@/components/icons";
import type { TypeKey } from "@/lib/keys";

export const TYPE_ICONS: Record<TypeKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  "residential-plot": PlotIcon,
  house: HouseIcon,
  commercial: ShopIcon,
  farmhouse: TreeIcon,
  "agriculture-land": FieldIcon,
};
