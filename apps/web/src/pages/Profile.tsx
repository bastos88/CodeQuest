import { ProfileSettingsCard } from '../components/dashboard/ProfileSettingsCard';
import { Card } from '../components/ui/Card';

export function Profile() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(108,99,255,0.16),transparent_18rem)]" />
        <div className="relative">
          <p className="section-kicker">account.settings</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-textPrimary">Perfil e segurança</h2>
          <p className="mt-3 max-w-2xl text-base text-textSecondary">Gerencie sua identidade pública e as credenciais locais da conta.</p>
        </div>
      </Card>
      <ProfileSettingsCard />
    </div>
  );
}
