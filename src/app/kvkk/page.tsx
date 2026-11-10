import { ShieldCheck, FileText, Lock } from "lucide-react";
import Link from "next/link";

export default function KVKKPage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            KVKK &amp; Kullanıcı Sözleşmesi
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
            Plumya platformu ve Minecraft sunucusunda kişisel verilerinizin korunması ve kullanım şartları.
          </p>
        </div>

        {/* Content Box */}
        <div className="glass-panel rounded-xl p-6 sm:p-8 border border-white/[0.08] space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-purple-400" />
              1. KVKK Aydınlatma Metni
            </h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, <strong>Plumya Network</strong> olarak, veri sorumlusu sıfatıyla tarafımıza iletmiş olduğunuz kişisel verilerinizin güvenliğine azami hassasiyet göstermekteyiz.
            </p>
            <p>
              Sitemize kayıt olurken ve sunucumuzda oynarken aşağıdaki kişisel verileriniz işlenmektedir:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
              <li><strong>Kimlik &amp; Profil Bilgileri:</strong> Minecraft kullanıcı adınız.</li>
              <li><strong>İletişim Bilgileri:</strong> Kayıt sırasında belirttiğiniz e-posta adresiniz.</li>
              <li><strong>İşlem ve Bağlantı Güvenliği:</strong> IP adresiniz, giriş ve oturum kayıtlarınız.</li>
              <li><strong>Destek Kayıtları:</strong> Açmış olduğunuz destek talepleri ve yetkili yazışmaları.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5 pt-5 border-t border-white/[0.06]">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <Lock size={16} className="text-purple-400" />
              2. Kişisel Verilerin İşlenme Amacı ve Aktarımı
            </h2>
            <p>
              Toplanan kişisel verileriniz; kullanıcı hesabınızın oluşturulması ve güvenliğinin sağlanması, oyun içi bakiye ve yetkilerinizin yönetilmesi, hile ve kural ihlallerinin önlenmesi ve tarafınıza destek hizmeti sunulması amaçlarıyla sınırlı olarak işlenmektedir.
            </p>
            <p>
              Kişisel verileriniz, yasal zorunluluklar ve adli makamların resmi talepleri haricinde hiçbir üçüncü kişi, kurum ya da reklam şirketi ile ticari amaçla paylaşılmaz ve satılmaz.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5 pt-5 border-t border-white/[0.06]">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-purple-400" />
              3. Kullanıcı Sözleşmesi ve Sunucu Kuralları
            </h2>
            <p>
              Plumya sunucusuna ve internet sitesine kayıt olan her kullanıcı aşağıdaki şartları peşinen kabul etmiş sayılır:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
              <li>Hesap şifresinin güvenliğini sağlamak tamamen kullanıcının kendi sorumluluğundadır.</li>
              <li>Sunucuda hile (cheat), yetkisiz yazılım (macro/autoclicker), açık istismarı (bug abuse) ve diğer oyuncuları rahatsız edici hakaret, küfür, dolandırıcılık kesinlikle yasaktır ve sınırsız uzaklaştırma sebebidir.</li>
              <li>Kredi mağazasından yapılan satın alımlar dijital oyun içi ürünler olup, hesaba aktarıldıktan sonra keyfi iade yapılamaz. Yaşanan sistemsel problemlerde destek ekibimiz telafi sağlamaktadır.</li>
              <li>Yönetim ekibi, sunucu düzenini ve adaletini sağlamak amacıyla kuralları ve oyun mekaniklerini güncelleme hakkını saklı tutar.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5 pt-5 border-t border-white/[0.06]">
            <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-purple-400" />
              4. İlgili Kişi Olarak Haklarınız
            </h2>
            <p>
              KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, yanlış işlenmişse düzeltilmesini talep etme veya hesabınızın silinmesini talep etme hakkına sahipsiniz. Bu taleplerinizi sitemizdeki <Link href="/support" className="text-purple-400 underline hover:text-purple-300">Destek Talepleri</Link> bölümünden iletebilirsiniz.
            </p>
          </section>

          {/* Bottom info */}
          <div className="pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-zinc-500 font-mono">
              Son Güncelleme: 2026 • Plumya Network
            </p>
            <Link
              href="/"
              className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
