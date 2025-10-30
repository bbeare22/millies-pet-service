type PageHeaderProps = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="max-w-3xl mx-auto text-center md:text-left space-y-2">
      <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
      {description ? (
        <p className="text-sm text-gray-600">{description}</p>
      ) : null}
    </div>
  );
}
