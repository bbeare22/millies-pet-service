type Props = {
  name: string;
  description: string;
  price: string;
  duration?: string;
};

export default function ServiceCard({ name, description, price, duration }: Props) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-white">

      {/* Title */}
      <h3 className="text-lg font-semibold text-text leading-tight">
        {name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>

      {/* Divider */}
      <div className="border-t border-[#7B6C57]/20 pt-3 flex items-center justify-between">
        
        {/* Price */}
        <span className="font-bold text-xl text-text">
          {price}
        </span>

        {/* Duration */}
        {duration && (
          <span className="text-xs text-gray-500">
            {duration}
          </span>
        )}
      </div>
    </div>
  );
}
