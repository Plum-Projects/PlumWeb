import {
  ShieldCheck,
  Cpu,
  Users,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Hakkımızda
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
            Plumya, Türkiye merkezli Minecraft oyuncuları için optimize edilmiş altyapı, adil ekonomi ve dengeli oyun modları sunan bağımsız bir topluluk ağıdır.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <Cpu className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Yüksek Performanslı Altyapı
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              128 tickrate optimizasyonu, kurumsal DDoS koruması ve yüksek frekanslı NVMe sunucularla sıfır gecikmeli oyun deneyimi.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <ShieldCheck className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Adil &amp; Dengeli Ekonomi
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Oyun içi emek değerlidir. Tüm eşyalar ve rütbeler adil rekabeti bozmayacak şekilde dengelenmiştir.
            </p>
          </div>

          <div className="glass-panel rounded-xl p-5 border border-white/[0.08]">
            <Users className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1.5">
              Aktif Moderasyon &amp; Destek
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Saygılı bir oyun ortamı için 7/24 aktif bilet sistemi ve Discord topluluğu üzerinden kesintisiz destek.
            </p>
          </div>
        </div>

        {/* Server Rules / Guidelines */}
        <div className="glass-panel rounded-xl p-6 border border-white/[0.08] space-y-4">
          <h2 className="text-base font-semibold text-white">
            Temel Sunucu Kuralları
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tüm oyuncularımızın keyifli ve adil bir deneyim yaşaması adına aşağıdaki kurallar istisnasız uygulanmaktadır:
          </p>

          <ul className="space-y-2.5 text-xs text-zinc-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle size={15} className="text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hile ve Haksız Avantaj:</strong> X-ray, fly, killaura veya oyun mekaniklerini suistimal eden üçüncü parti yazılımlar kesinlikle yasaktır ve kalıcı uzaklaştırma sebebidir.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={15} className="text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Saygılı İletişim:</strong> Sohbet kanallarında nefret söylemi, hakaret, argo, spam veya reklam içerikli paylaşımlar yasaktır.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle size={15} className="text-purple-400 shrink-0 mt-0.5" />
              <span>
                <strong>Hesap ve Eşya Güvenliği:</strong> Hesap güvenliği oyuncunun sorumluluğundadır. Güçlü şifre kullanımı önerilir.
              </span>
            </li>
          </ul>
        </div>

        {/* Connection Box */}
        <div className="glass-panel rounded-xl p-6 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Sunucuya Doğrudan Bağlanın
            </h3>
            <p className="text-xs text-zinc-400">
              Minecraft istemcinizde Çok Oyunculu alanına adresi girerek hemen giriş yapabilirsiniz.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <code className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-200">
              play.plumya.net
            </code>
            <Link
              href="/"
              className="gradient-btn px-4 py-1.5 rounded-lg text-xs font-medium"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
