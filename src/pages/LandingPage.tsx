import { Button } from "@/components/ui/button"
import {
  Users,
  Menu,
  ChevronDown,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Leaf,
} from "lucide-react"
import { Link, NavLink } from "react-router-dom"
import { useState } from "react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqItems = [
    {
      question: "What is Plogging?",
      answer:
        "Plogging is a fitness and environmental activity that combines jogging with picking up litter. It's a fun and impactful way to stay active while contributing to a cleaner environment.",
    },
    {
      question: "How often does Plogging events?",
      answer:
        "We organize plogging events regularly, typically every weekend in different locations around Addis Ababa. Check our events page for the latest schedule.",
    },
    {
      question: "How does plogging be started?",
      answer:
        "Getting started is easy! Simply join one of our events, bring comfortable running shoes, and we'll provide the equipment needed for collecting litter.",
    },
    {
      question: "Can groups participate in Plogging events?",
      answer:
        "We welcome groups, families, schools, and organizations. Group participation makes the activity more fun and impactful.",
    },
    {
      question: "Is there an age limit for participation?",
      answer:
        "Plogging is suitable for all ages. Children should be accompanied by adults, and we adapt activities to ensure everyone can participate safely.",
    },
    {
      question: "What do I need to bring to a Plogging event?",
      answer:
        "Just bring comfortable running/walking shoes, water, and enthusiasm! We provide gloves, bags, and other equipment needed for the cleanup.",
    },
    {
      question: "How often do you organize Plogging events?",
      answer:
        "We organize events every weekend, with special events during environmental awareness days and holidays.",
    },
    {
      question: "Can I organize a Plogging event in my area?",
      answer:
        "Yes! We support community leaders who want to organize local events. Contact us for guidance and support in setting up events in your area.",
    },
    {
      question: "Do you provide certificates or recognition for participants?",
      answer:
        "Yes, we provide digital certificates for participants and special recognition for regular volunteers and outstanding contributors.",
    },
    {
      question: "How can I stay updated on upcoming events and news?",
      answer:
        "Follow us on social media, subscribe to our newsletter, or check our website regularly for the latest updates on events and news.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/logo.png" // <-- replace with actual logo file
                  alt="Plogging Ethiopia Logo"
                  className="h-28 w-auto ml-5"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-12 mr-10">
              {[
                { name: "Home", to: "/" },
                { name: "About", to: "/about" },
                { name: "Membership", to: "/membership" },
                { name: "Gallery", to: "/gallery" },
                { name: "Blog", to: "/blog" },
                { name: "Event", to: "/events" },
                { name: "Contact", to: "/contact" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative pb-1 font-normal text-xl transition-colors ${
                      isActive
                        ? "text-black hover:text-green-600 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-1 after:w-full after:bg-green-500 after:rounded-full"
                        : "text-black hover:text-green-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-3">
                {[
                  { name: "Home", to: "/" },
                  { name: "About", to: "/about" },
                  { name: "Membership", to: "/membership" },
                  { name: "Gallery", to: "/gallery" },
                  { name: "Blog", to: "/blog" },
                  { name: "Event", to: "/events" },
                  { name: "Contact", to: "/contact" },
                ].map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      isActive
                        ? "text-green-600 font-medium"
                        : "text-gray-700 hover:text-green-600"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-800 via-gray-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Welcome to
                <br />
                <span className="text-green-400">Plogging Ethiopia</span>
              </h1>
              <p className="text-xl text-gray-200">Stride with purpose and cleanse with passion!</p>
              <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg">Join Now</Button>

              {/* Logo */}
              <div className="mt-8">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <Users className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-xs font-bold">PLOGGING</div>
                      <div className="text-xs">ETHIOPIA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Group Photo */}
            <div className="relative">
              <div className="bg-url(src/) backdrop-blur-sm rounded-lg p-4">
                <img
                  src="/placeholder.svg?height=400&width=600&text=Community+Group+Photo"
                  alt="Plogging Ethiopia Community"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  Plogging-Ethiopia traces its origins back to a family excursion that spanned more than five years
                  before officially launching in January 2021 at Entoto Park, Addis Ababa. The individuals behind this
                  initiative are Firew Kefyalew, a father, and his three sons – Yeab, Lihiq, and Amnen.
                </p>
                <p>
                  Plogging-Ethiopia goes beyond simply collecting trash; it represents a dynamic movement that combines
                  physical fitness, community involvement, and environmental responsibility. The concept, originating
                  from Sweden, quickly gained momentum as Firew and a growing community of volunteers realized its
                  potential to make a meaningful impact in Ethiopia. Our dedicated volunteers, comprising students and
                  professionals alike, unite under a shared objective: fostering a healthier Ethiopia by tackling
                  plastic pollution and advocating for an active way of life.
                </p>
              </div>
            </div>
            <div>
              <img
                src="/placeholder.svg?height=400&width=500&text=Plogging+Activity+Photo"
                alt="Plogging Activity"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is Plogging Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/placeholder.svg?height=400&width=500&text=Outdoor+Plogging+Scene"
                alt="What is Plogging"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">What is Plogging?</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  Plogging is more than an exercise routine; it's a revolutionary approach to environmental stewardship.
                  Participants jog or walk, intermittently stopping to pick up litter along their route. This simple yet
                  powerful activity not only promotes physical fitness but also raises awareness about the impact of
                  plastic pollution on our communities and environment.
                </p>
                <p>
                  The beauty of plogging lies in its accessibility and immediate impact. Whether you're a seasoned
                  runner or prefer a leisurely walk, plogging adapts to your fitness level while contributing to a
                  cleaner, healthier environment for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Mission</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  At the core of Plogging-Ethiopia is a mission to create a cleaner, greener Ethiopia while promoting
                  physical fitness and community engagement. Every stride has impact, can pave the way for substantial
                  change. By encouraging plogging, we aim to inspire people to take responsibility for their environment
                  while promoting an active and healthy lifestyle.
                </p>
                <p>
                  We believe that small actions, when multiplied by millions of people, can transform the world. Our
                  mission extends beyond cleaning up litter – we're building a movement that fosters environmental
                  consciousness and community solidarity across Ethiopia.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-80 h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/placeholder.svg?height=320&width=320&text=Mission+Circle+Photo"
                  alt="Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-80 h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/placeholder.svg?height=320&width=320&text=Environmental+Impact"
                  alt="Our Impact"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Impact</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  Plogging Ethiopia's remarkable achievements have gained both national and international recognition.
                  Since our inception, we have organized numerous events, contributed to Ethiopia's Prime Minister for
                  their exceptional community service. Despite starting from humble beginnings without an official
                  office, our impact has been profound. We have successfully organized events that have attracted
                  hundreds of participants, collected tons of waste, and raised collective action and the positive
                  energy that drives social change. Our movement has become a symbol of grassroots environmental
                  activism in Ethiopia, inspiring similar initiatives across the country.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">About us</h2>
          <h3 className="text-2xl font-semibold text-green-600 mb-8">Welcome to Plogging-Ethiopia</h3>

          <div className="max-w-4xl mx-auto text-gray-600 leading-relaxed mb-12">
            <p>
              Embark on a journey of impact and sustainability with Plogging-Ethiopia! As pioneers of the plogging
              movement in Ethiopia, we are more than just an ordinary initiative – we are a community dedicated to
              transforming lives and environments, one stride at a time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img
              src="/placeholder.svg?height=300&width=400&text=Community+Action+Photo"
              alt="Community in Action"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
            <img
              src="/placeholder.svg?height=300&width=400&text=Group+Celebration+Photo"
              alt="Group Celebration"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Message From Founder Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Message From The Founder</h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p className="font-semibold text-gray-800">Welcome, Esteemed Visitors,</p>
                <p>
                  Step into the world of Plogging-Ethiopia's website, where passion meets purpose online to create a
                  cleaner and healthier Ethiopia. As the founder, I am delighted to invite you to explore our digital
                  space, a reflection of our unwavering commitment to environmental stewardship and community
                  well-being. Here, you will discover the heart and soul of our movement in the well-being of our
                  environment through plogging.
                </p>
                <p>
                  Our website serves as a gateway to a community united by a shared vision of a cleaner, healthier
                  Ethiopia at home. By combining the power of positive energy running through volunteering, we aim to
                  bring about positive change that resonates far beyond our immediate surroundings. As you navigate
                  through our pages, you will witness the transformative power of collective action and the profound
                  impact that each individual can have on our environment.
                </p>
                <p>
                  Together, let us embark on this journey towards a more sustainable and greener Ethiopia. Your support
                  is truly invaluable.
                </p>
                <div className="mt-6">
                  <p className="font-semibold text-gray-800">Firew Kefyalew</p>
                  <p className="text-gray-600">Founder, Plogging-Ethiopia</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-gray-200 rounded-lg p-8 max-w-sm">
                <img
                  src="/placeholder.svg?height=400&width=300&text=Founder+Portrait"
                  alt="Firew Kefyalew - Founder"
                  className="w-full h-80 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">FAQ?</h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-gray-800">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm text-green-100">
                <li>Addis Ababa</li>
                <li>Ethiopia</li>
                <li>Gallery</li>
                <li>Blog</li>
                <li>Contact Us</li>
              </ul>
            </div>

            {/* Subscribe */}
            <div>
              <h4 className="font-semibold mb-4">Subscribe</h4>
              <p className="text-sm text-green-100 mb-4">
                Sign up with your email address to receive news and updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 px-3 py-2 text-gray-800 rounded-l-md"
                />
                <Button className="bg-green-700 hover:bg-green-800 rounded-l-none">Sign Up</Button>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-3">
                <Facebook className="w-6 h-6 text-green-100 hover:text-white cursor-pointer" />
                <Twitter className="w-6 h-6 text-green-100 hover:text-white cursor-pointer" />
                <Instagram className="w-6 h-6 text-green-100 hover:text-white cursor-pointer" />
                <Youtube className="w-6 h-6 text-green-100 hover:text-white cursor-pointer" />
                <Linkedin className="w-6 h-6 text-green-100 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Logo */}
            <div className="flex justify-center md:justify-end">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-green-500 mt-8 pt-8 text-center text-sm text-green-100">
            <p>&copy; 2024 Plogging Ethiopia. All rights reserved.</p>
            <p className="mt-2">Powered by Pixel Addis Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 