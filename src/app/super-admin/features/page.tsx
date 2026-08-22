import { PageHeader } from "@/components/ui";
import { FeatureFlagsBoard } from "@/features/support/components/feature-flags-board";

export const metadata = { title: "Feature-Flags" };

export default function FeaturesPage() {
  return (
    <>
      <PageHeader title="Feature-Flags" subtitle="Module global und je Mandant aktivieren oder deaktivieren. Zukünftige Erweiterungen werden hier freigeschaltet." />
      <FeatureFlagsBoard />
    </>
  );
}
