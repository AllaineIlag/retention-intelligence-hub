interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold">Live Interview Verification</h1>
      <p className="text-gray-500">Resignation ID: {id} - Placeholder</p>
    </div>
  );
}
