import { redirect } from "next/navigation";

export default function OnboardRedirect({ params }: { params: { token: string } }) {
  redirect(`/businesses/${params.token}/claim`);
}
