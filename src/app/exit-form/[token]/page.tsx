export default async function ExitFormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <div className="container mx-auto py-10">
      <h1>Exit Interview Form</h1>
      <p>Token: {token}</p>
    </div>
  );
}
