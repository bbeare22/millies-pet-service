type Props = {
  name: string;
  description: string;
  price: string;     
  duration?: string; 
};

export default function ServiceCard({ name, description, price, duration }: Props) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-xl">{price}</span>
        {duration ? <span className="text-sm text-gray-500">{duration}</span> : null}
      </div>
    </div>
  );
}
