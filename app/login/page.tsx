import { LoginExperience } from "./LoginExperience";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return <LoginExperience initialMessage={message} />;
}
