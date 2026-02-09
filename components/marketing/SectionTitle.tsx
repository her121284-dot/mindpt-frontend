interface SectionTitleProps {
  title: string;
  sub?: string;
}

export default function SectionTitle({ title, sub }: SectionTitleProps) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#111]">{title}</h2>
      <div className="mt-2 mx-auto w-10 h-1 rounded-full bg-[#FF6A00]" />
      {sub && <p className="mt-3 text-[#666] text-sm sm:text-base">{sub}</p>}
    </div>
  );
}
