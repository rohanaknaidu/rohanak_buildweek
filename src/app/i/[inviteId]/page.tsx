import { DirectDropFlow } from "../../DirectDropFlow";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ inviteId: string }>;
}) {
  const { inviteId } = await params;

  return <DirectDropFlow inviteId={inviteId} />;
}
