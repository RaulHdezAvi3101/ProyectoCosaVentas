import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { PublicProfile } from "@/features/auth/types";

interface SellerStatsCardProps {
  profile: PublicProfile;
  followerCount: number;
}

function formatHours(hours: number): string {
  if (hours < 24) {
    return `${hours} h`;
  }

  const days = Math.round(hours / 24);
  return `${days} día${days === 1 ? "" : "s"}`;
}

export function SellerStatsCard({ profile, followerCount }: SellerStatsCardProps) {
  const { sellerProfile } = profile;

  return (
    <Card>
      <h2 className="mb-4 font-display text-lg font-semibold text-ink">
        Estadísticas públicas
      </h2>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink/60">Ventas totales</dt>
          <dd className="text-2xl font-semibold text-ink">
            {sellerProfile.sales.toLocaleString("es-MX")}
          </dd>
        </div>
        <div>
          <dt className="text-ink/60">Tiempo promedio de envío</dt>
          <dd className="text-2xl font-semibold text-ink">
            {formatHours(sellerProfile.avgShipHours)}
          </dd>
        </div>
        <div>
          <dt className="text-ink/60">Tasa de respuesta</dt>
          <dd className="text-2xl font-semibold text-ink">
            {sellerProfile.responseRate}%
          </dd>
        </div>
        <div>
          <dt className="text-ink/60">Seguidores</dt>
          <dd className="text-2xl font-semibold text-ink">
            {followerCount.toLocaleString("es-MX")}
          </dd>
        </div>
        <div>
          <dt className="text-ink/60">Puntaje</dt>
          <dd className="font-medium text-brand">{sellerProfile.score} pts</dd>
        </div>
        <div>
          <dt className="text-ink/60">Envíos a tiempo</dt>
          <dd className="font-medium text-ink">{sellerProfile.onTimeShipping}%</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="neutral" className="capitalize">
          {sellerProfile.tier}
        </Badge>
        <Badge variant="neutral">
          {sellerProfile.positiveRate}% positivas
        </Badge>
      </div>
    </Card>
  );
}
