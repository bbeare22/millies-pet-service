type Props = {
  name: string;
  description: string;
  priceCents: number;
  durationMin: number;
};
export default function ServiceCard({ name, description, priceCents, durationMin }: Props) {
  const price = (priceCents / 100).toFixed(2);
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-xl">${price}</span>
        <span className="text-sm text-gray-500">{durationMin} min</span>
      </div>
    </div>
  );
}