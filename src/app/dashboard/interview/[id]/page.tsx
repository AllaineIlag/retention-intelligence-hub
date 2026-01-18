export default async function InterviewCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-10">
      <h1>Interview Case: {id}</h1>
    </div>
  );
}
