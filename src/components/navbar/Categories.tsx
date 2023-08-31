"use client";

import { PiEyeClosedBold, PiDressBold } from "react-icons/pi";
import { LuStethoscope, LuDog } from "react-icons/lu";
import { TbHorseToy, TbTool } from "react-icons/tb";
import { BiHome, BiHomeHeart } from "react-icons/bi";
import {
  MdDevices,
  MdOutlineChair,
  MdSportsSoccer,
  MdOutlineLocalGroceryStore,
  MdOutlineDiamond,
} from "react-icons/md";
import CategoryBox from "./CategoryBox";
import Container from "../Container";
import { api } from "@/utils/api";

export const categories = [
  {
    label: "Electronics",
    icon: MdDevices,
    description: "This property is close to the beach!",
  },
  {
    label: "Clothing",
    icon: PiDressBold,
    description: "This property is has windmills!",
  },
  {
    label: "Furniture",
    icon: MdOutlineChair,
    description: "This property is modern!",
  },
  {
    label: "Beauty",
    icon: PiEyeClosedBold,
    description: "This property is in the countryside!",
  },
  {
    label: "Sports",
    icon: MdSportsSoccer,
    description: "This is property has a beautiful pool!",
  },
  {
    label: "Toys",
    icon: TbHorseToy,
    description: "This property is on an island!",
  },
  {
    label: "Groceries",
    icon: MdOutlineLocalGroceryStore,
    description: "This property is near a lake!",
  },
  {
    label: "Jewelry",
    icon: MdOutlineDiamond,
    description: "This property has skiing activies!",
  },
  {
    label: "Health",
    icon: LuStethoscope,
    description: "This property is an ancient castle!",
  },
  {
    label: "Pets",
    icon: LuDog,
    description: "This property is in a spooky cave!",
  },
  {
    label: "Decor",
    icon: BiHomeHeart,
    description: "This property offers camping activities!",
  },
  {
    label: "Tools",
    icon: TbTool,
    description: "This property is in arctic environment!",
  },
];

const Categories = () => {
  const { data } = api.category.getCategories.useQuery({});

  if (data instanceof Error) return <div>Error</div>;
  if (data === undefined) return <div>Loading...</div>;

  return (
    <Container>
      <div
        className="
          flex
          flex-row 
          items-center 
          justify-between 
          overflow-x-auto
          pt-4
        "
      >
        <CategoryBox label="Home" icon={BiHome} selected={category === null} />
        {categories.map((item, i) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            selected={category === item.label}
            id={
              data instanceof Error || data === undefined
                ? undefined
                : data[i]!.id
            }
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
