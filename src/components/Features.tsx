import { TbTruckDelivery, TbDiscount } from "react-icons/tb";
import { RiRefund2Fill } from "react-icons/ri";
import { MdSupportAgent } from "react-icons/md";
import { FC } from "react";
import FeatureCard from "./FeatureCard";
import { useCurrency } from "../hooks/useCurrency";

const Features: FC = () => {
  const { formatPrice } = useCurrency();

  const data = [
    {
      icon: <TbTruckDelivery className="text-3xl" />,
      title: "Free Delivery",
      desc: "Orders from all items",
    },
    {
      icon: <RiRefund2Fill className="text-3xl" />,
      title: "Return & Refund",
      desc: "Money back guarantee",
    },
    {
      icon: <TbDiscount className="text-3xl" />,
      title: "Member Discount",
      desc: `On orders over ${formatPrice(99, { showDecimals: false })}`,
    },
    {
      icon: <MdSupportAgent className="text-3xl" />,
      title: "Support 24/7",
      desc: "Contact us 24 hours a day",
    },
  ];

  return (
    <div className="px-4 container grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8 mx-auto">
      {data.map((item) => (
        <FeatureCard
          key={item.title}
          icon={item.icon}
          title={item.title}
          desc={item.desc}
        />
      ))}
    </div>
  );
};

export default Features;
