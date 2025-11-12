import Link from 'next/link'
import { ArrowRight, Target, TrendingDown, Trophy, Users } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            DontBuyTech
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Break free from tech consumerism. Track your minimalism journey.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<Target className="h-8 w-8 text-green-600" />}
            title="Track Devices"
            description="Monitor your current tech inventory and set reduction goals"
          />
          <FeatureCard
            icon={<TrendingDown className="h-8 w-8 text-green-600" />}
            title="Avoid Purchases"
            description="Log purchases you avoided and see your savings grow"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-green-600" />}
            title="Join Challenges"
            description="Participate in community challenges like '30 Days No Tech'"
          />
          <FeatureCard
            icon={<Trophy className="h-8 w-8 text-green-600" />}
            title="Earn Badges"
            description="Unlock achievements for sustainable tech habits"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Tech Minimalism?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Every gadget you don't buy saves money, reduces e-waste, and frees you from the upgrade cycle.
            Join thousands making conscious decisions about technology consumption.
          </p>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
