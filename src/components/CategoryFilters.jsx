import { useState } from "react";
import {
  Grid2x2,
  Construction,
  Droplets,
  Zap,
  Trees,
  Trash2
} from "lucide-react";

const categories = [
  {
    id: "all",
    label: "All",
    icon: Grid2x2
  },
  {
    id: "roads",
    label: "Roads",
    icon: Construction
  },
  {
    id: "water",
    label: "Water",
    icon: Droplets
  },
  {
    id: "electricity",
    label: "Electricity",
    icon: Zap
  },
  {
    id: "parks",
    label: "Parks",
    icon: Trees
  },
  {
    id: "dumping",
    label: "Illegal Dumping",
    icon: Trash2
  }
];

export default function CategoryFilters() {

  const [selected, setSelected] = useState("all");

  return (

    <div className="category-filters">

      {categories.map((category) => {

        const Icon = category.icon;

        return (

          <button
            key={category.id}
            onClick={() => setSelected(category.id)}
            className={
              selected === category.id
                ? "category-chip active"
                : "category-chip"
            }
          >

            <Icon size={16} />

            {category.label}

          </button>

        );

      })}

    </div>

  );

}