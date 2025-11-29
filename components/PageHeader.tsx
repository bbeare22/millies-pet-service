type PageHeaderProps = {
  title: string;
  description?: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="animate-fadeIn mb-6">
      <div className="max-w-3xl mx-auto text-center md:text-left space-y-3">

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text">
          {title}
        </h1>

        {/* Optional description */}
        {description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}

      </div>
    </header>
  );
}
