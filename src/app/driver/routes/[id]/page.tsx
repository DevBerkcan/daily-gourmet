import { DriverRouteDetail } from "@/features/logistics/components/route-detail";

type Props = { params: Promise<{ id: string }> };

export default async function DriverRoutePage({ params }: Props) {
  const { id } = await params;
  return <DriverRouteDetail id={id} />;
}
