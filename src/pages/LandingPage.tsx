import { Button } from "@/components/ui/button";
import {
  Menu,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Leaf,
  ImageIcon,
  Calendar,
  Clock,
  Trophy,
  Users
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { GalleryImage } from "@/lib/api";

// Define types for blog posts
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  featured_image_url?: string;
  published_at: string;
  meta_data?: {
    read_time?: string;
  };
}

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set());
  const sectionRefs = useRef<(HTMLDivElement | null)[]>(Array(12).fill(null));  // Updated to 12 sections
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [topVolunteers, setTopVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  ];

  // Fetch gallery and blog data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch gallery images (first 6 for the preview)
        const galleryResponse = await apiClient.getAllGalleryImages(1);
        const galleryData = galleryResponse?.data?.data || [];
        setGalleryImages(galleryData.slice(0, 6));
        
        // Fetch blog posts (first 3 for the preview)
        const blogResponse = await apiClient.getAllBlogPosts();
        let blogData = [];
        if (Array.isArray(blogResponse.data)) {
          blogData = blogResponse.data;
        } else if (blogResponse.data && typeof blogResponse.data === 'object') {
          const dataObj = blogResponse.data as Record<string, any>;
          if (Object.hasOwnProperty.call(dataObj, 'posts') && Array.isArray(dataObj.posts)) {
            blogData = dataObj.posts;
          } else if (Object.hasOwnProperty.call(dataObj, 'data') && Array.isArray(dataObj.data)) {
            blogData = dataObj.data;
          } else if (Object.hasOwnProperty.call(dataObj, 'id')) {
            blogData = [dataObj];
          } else {
            blogData = [];
          }
        }
        setBlogPosts(blogData.slice(0, 3));
        
        // Fetch top volunteers for leaderboard preview
        const leaderboardResponse = await apiClient.getPublicTopVolunteersReport();
        let leaderboardData = [];
        if (leaderboardResponse.data.volunteers) {
          leaderboardData = leaderboardResponse.data.volunteers;
        } else if (Array.isArray(leaderboardResponse.data)) {
          leaderboardData = leaderboardResponse.data;
        } else if (leaderboardResponse.data && typeof leaderboardResponse.data === 'object' && !Array.isArray(leaderboardResponse.data)) {
          if (Array.isArray(leaderboardResponse.data.data)) {
            leaderboardData = leaderboardResponse.data.data;
          } else {
            leaderboardData = [leaderboardResponse.data];
          }
        }
        setTopVolunteers(leaderboardData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
        // Use static data as fallback
        setGalleryImages([
          { id: 1, title: "Community cleanup", image_url: "/story-1.png" } as GalleryImage,
          { id: 2, title: "Team plogging", image_url: "/story-2.png" } as GalleryImage,
          { id: 3, title: "Group photo", image_url: "/story-3.png" } as GalleryImage,
          { id: 4, title: "Before and after", image_url: "/story-4.png" } as GalleryImage,
          { id: 5, title: "Youth participation", image_url: "/about-5.png" } as GalleryImage,
          { id: 6, title: "Plogging gear", image_url: "/about-6.png" } as GalleryImage,
        ]);
        setBlogPosts([
          {
            id: 1,
            title: "The Environmental Impact of Plogging",
            excerpt: "Discover how plogging contributes to environmental conservation...",
            featured_image_url: "/story-1.png",
            published_at: "2024-05-15",
            meta_data: { read_time: "5 min read" }
          },
          {
            id: 2,
            title: "Getting Started with Plogging",
            excerpt: "Learn everything you need to know to start your plogging journey...",
            featured_image_url: "/story-2.png",
            published_at: "2024-05-10",
            meta_data: { read_time: "4 min read" }
          },
          {
            id: 3,
            title: "Plogging Events This Weekend",
            excerpt: "Join us for our upcoming plogging events in Addis Ababa...",
            featured_image_url: "/story-3.png",
            published_at: "2024-05-05",
            meta_data: { read_time: "3 min read" }
          }
        ]);
        setTopVolunteers([
          {
            volunteer_id: 1,
            first_name: "Sarah",
            last_name: "Johnson",
            total_hours_contributed: "45.5",
            events_attended: 12,
            badges_earned: 3
          },
          {
            volunteer_id: 2,
            first_name: "Michael",
            last_name: "Smith",
            total_hours_contributed: "38.2",
            events_attended: 10,
            badges_earned: 2
          },
          {
            volunteer_id: 3,
            first_name: "Emma",
            last_name: "Williams",
            total_hours_contributed: "32.7",
            events_attended: 8,
            badges_earned: 4
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Intersection Observer to detect when sections are in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-section-index'));
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.setAttribute('data-section-index', index.toString());
        observer.observe(ref);
      }
    });

    return () => {
      sectionRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      

      {/* Hero Section */}
      <section className="relative h-[75vh] w-full flex items-center text-white overflow-hidden">
        {/* Background Image with Black Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/header-left.png')" }}
          >
            <div className="absolute inset-0 bg-black/70"></div>
          </div>
        </div>

        {/* Bold Green Diagonal Overlay with White Borders */}
        <div className="absolute right-0 top-0 h-full w-[30%] transform -skew-x-[30deg] origin-top-right z-10 flex">
          {/* Left white edge */}
          <div className="w-10 h-full bg-white/30"></div>

          {/* Green diagonal */}
          <div className="flex-1 bg-green-600 opacity-80 shadow-xl"></div>

          {/* Right white edge */}
          <div className="w-10 h-full bg-white/30"></div>
        </div>

        {/* Content - positioned above backgrounds */}
        <main className="relative z-20 w-full flex flex-col items-center gap-12 pb-0">
          <div className="grid md:grid-cols-2 w-full text-white py-10 pl-5">
            <div className="flex flex-col items-start justify-center w-full h-full gap-8">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-left">
                Welcome to Plogging Ethiopia
              </h1>
              <p className="text-xl sm:text-2xl italic mb-6">
                Stride with purpose, cleanse with passion
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-green-500 hover:bg-green-700 text-white font-light py-2 px-6 rounded self-start">
                  <a href="/#aboutus">Get Started</a>
                </button>
                <div className="w-1/2 sm:w-1/3 rounded-full overflow-hidden">
                  <img
                    className="w-full"
                    alt="Plogging Ethiopia"
                    src="/logo.png"
                  />
                </div>
              </div>
            </div>

            <div className="relative z-20 flex items-center justify-center">
              <img src="/header-left.png" alt="Plogging illustration" className="max-h-[70vh] object-contain hidden md:block" />
            </div>
          </div>
        </main>
      </section>

      {/* Our Story Section with transition */}
      <section
        ref={el => sectionRefs.current[0] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-white w-full flex flex-col items-center justify-center transition-all duration-700 transform ${
          visibleSections.has(0) 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl">
            {/* Text Content */}
            <div className="flex flex-col items-start gap-4 md:gap-6 md:w-[60%] w-full md:order-1 order-2 p-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-left">
                Our Story
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                Plogging-Ethiopia traces its origins back to a family excursion
                that spanned more than five years before officially launching in
                January 2021 at Entoto Park, Addis Ababa. The individuals behind
                this initiative are Firew Kefyalew, a father, and his three sons
                – Yeab, Lihiq, and Amnen.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                Plogging-Ethiopia goes beyond simply collecting trash; it
                represents a dynamic movement that combines physical fitness,
                community involvement, and environmental responsibility. The
                concept, originating from Sweden, quickly gained momentum as
                Firew and a growing community of volunteers realized its
                potential to make a meaningful impact in Ethiopia. Our dedicated
                volunteers, comprising students and professionals alike, unite
                under a shared objective: fostering a healthier Ethiopia by
                tackling plastic pollution and advocating for an active way of
                life.
              </p>
            </div>

            {/* Image Section */}
            <div className="md:order-2 order-1 w-full md:w-[40%] flex justify-center items-center p-4">
              <img
                src="/story-1.png"
                alt="Plogging Activity"
                className="w-full h-60 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is Plogging Section with transition */}
      <section
        ref={el => sectionRefs.current[1] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-gray-50 w-full flex flex-col items-center justify-center transition-all duration-700 delay-100 transform ${
          visibleSections.has(1)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl">
            {/* Image Section */}
            <div className="md:order-1 order-2 w-full md:w-[40%] flex justify-center items-center p-4">
              <img
                src="/story-2.png"
                alt="What is Plogging"
                className="w-full h-60 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start gap-4 md:gap-6 md:w-[60%] w-full md:order-2 order-1 p-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-left">
                What is Plogging?
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                Plogging is more than an exercise routine; it's a revolutionary
                approach to environmental stewardship. Participants jog or walk,
                intermittently stopping to pick up litter along their route.
                This simple yet powerful activity not only promotes physical
                fitness but also raises awareness about the impact of plastic
                pollution on our communities and environment.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                The beauty of plogging lies in its accessibility and immediate
                impact. Whether you're a seasoned runner or prefer a leisurely
                walk, plogging adapts to your fitness level while contributing
                to a cleaner, healthier environment for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section with transition */}
      <section
        ref={el => sectionRefs.current[2] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-white w-full flex flex-col items-center justify-center transition-all duration-700 delay-200 transform ${
          visibleSections.has(2)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl">
            {/* Text Content */}
            <div className="flex flex-col items-start gap-4 md:gap-6 md:w-[60%] w-full md:order-1 order-2 p-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-left">
                Mission
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                At the core of Plogging-Ethiopia is a mission to create a
                cleaner, greener Ethiopia while promoting physical fitness and
                community engagement. Every stride has impact, can pave the way
                for substantial change. By encouraging plogging, we aim to
                inspire people to take responsibility for their environment
                while promoting an active and healthy lifestyle.
              </p>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                We believe that small actions, when multiplied by millions of
                people, can transform the world. Our mission extends beyond
                cleaning up litter – we're building a movement that fosters
                environmental consciousness and community solidarity across
                Ethiopia.
              </p>
            </div>

            {/* Image Section */}
            <div className="md:order-2 order-1 w-full md:w-[40%] flex justify-center items-center p-4">
              <div className="w-60 h-60 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/story-3.png"
                  alt="Mission"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact Section with transition */}
      <section
        ref={el => sectionRefs.current[3] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-gray-50 w-full flex flex-col items-center justify-center transition-all duration-700 delay-300 transform ${
          visibleSections.has(3)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl">
            {/* Image Section */}
            <div className="md:order-1 order-2 w-full md:w-[40%] flex justify-center items-center p-4">
              <div className="w-60 h-60 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg">
                <img
                  src="/story-4.png"
                  alt="Our Impact"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start gap-4 md:gap-6 md:w-[60%] w-full md:order-2 order-1 p-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 text-left">
                Our Impact
              </h2>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed font-sans">
                Plogging Ethiopia's remarkable achievements have gained both
                national and international recognition. Since our inception, we
                have organized numerous events, contributed to Ethiopia's Prime
                Minister for their exceptional community service. Despite
                starting from humble beginnings without an official office, our
                impact has been profound. We have successfully organized events
                that have attracted hundreds of participants, collected tons of
                waste, and raised collective action and the positive energy that
                drives social change. Our movement has become a symbol of
                grassroots environmental activism in Ethiopia, inspiring similar
                initiatives across the country.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section with transition */}
      <section
        ref={el => sectionRefs.current[4] = el as HTMLDivElement | null}
        id="aboutus"
        className={`relative grid md:grid-cols-2 w-[90%] mx-auto md:h-[85vh] shadow-lg transition-all duration-700 delay-400 transform ${
          visibleSections.has(4)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Left Image */}
        <img
          src="/about-5.png"
          className="rounded-md"
          alt="story"
        />

        {/* Empty Spacer or Background Column */}
        <div className="hidden md:block"></div>

        {/* Floating Content Block with Headings and Paragraph */}
        <div className="md:absolute p-4 right-0 top-1/3 md:w-4/5 w-full flex flex-col md:flex-row justify-around gap-5 ml-auto">
          <img
            src="/about-6.png"
            className="rounded-md"
            alt="story"
          />
          <div className="flex flex-col items-start md:w-3/4 w-[90%] gap-6 text-left">
            <h1 className="text-4xl md:text-5xl font-bold font-sans mt-4">
              About us
            </h1>
            <h2 className="text-3xl text-left font-semibold mt-2 text-center">
              Welcome to Plogging-Ethiopia
            </h2>
            <p className="font-sans text-lg">
              Embark on a journey of impact and sustainability with
              Plogging-Ethiopia! As trailblazers in the movement for a greener
              Ethiopia, we are more than a voluntary initiative — we are a
              community dedicated to transforming lives and our environment, one
              stride at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Landing Form Section with transition */}
      <section
        ref={el => sectionRefs.current[5] = el as HTMLDivElement | null}
        className={`w-full grid place-items-center mt-20 landing-form transition-all duration-700 delay-500 transform ${
          visibleSections.has(5)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* You can insert your form or content here */}
      </section>

      {/* Message From The Founder Section with transition */}
      <section
        ref={el => sectionRefs.current[6] = el as HTMLDivElement | null}
        className={`founder-message grid md:grid-cols-2 place-items-center w-[90%] mx-auto gap-6 shadow-lg transition-all duration-700 delay-600 transform mt-20 ${
          visibleSections.has(6)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        {/* Text Block */}
        <div className="flex flex-col text-left gap-5 p-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Message From The Founder
          </h1>
          <p className="font-sans text-lg text-gray-700">
            Welcome, Esteemed Visitors!
          </p>
          <p className="font-sans text-lg text-gray-700">
            Step into the world of Plogging-Ethiopia's website, where passion
            and purpose unite to create a cleaner and healthier Ethiopia. As the
            founder, I am absolutely thrilled to have you explore our website
            and witness the incredible efforts of individuals who are dedicated
            to the well-being of our environment through plogging.
          </p>
          <p className="font-sans text-lg text-gray-700">
            We are a young and vibrant organization, constantly striving to
            inspire change one eco-friendly stride at a time. By harnessing the
            power of positive energy expressed through volunteerism, we aim to
            bring about organic social change driven by individuals like
            yourself. Take a deep dive into our pages to discover our
            initiatives, join our events, and find valuable resources to embrace
            sustainable living. Together, we can make a lasting impact on our
            environment.
          </p>
          <p className="font-sans text-lg text-gray-700">
            Thank you for embarking on this journey with us towards a more
            vibrant and greener Ethiopia. Your support is truly invaluable.
          </p>
          <p className="font-sans text-lg text-gray-700">With warm regards,</p>
          <p className="font-sans text-lg font-semibold text-gray-800">
            Firew Kefyalew
          </p>
          <p className="font-sans text-lg text-gray-600">
            Founder, Plogging-Ethiopia.
          </p>
        </div>

        {/* Founder Image */}
        <img
          src="/founder-photo.png"
          className="w-full h-full object-cover rounded-md"
          alt="Mr. Firew Kefyalew"
        />
      </section>

      {/* Gallery Preview Section */}
      <section
        ref={el => sectionRefs.current[8] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-green-50 w-full transition-all duration-700 transform ${
          visibleSections.has(8) 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <ImageIcon className="h-8 w-8 text-green-600 mr-2" />
              <h2 className="text-3xl md:text-4xl font-bold text-green-800">
                Gallery
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Take a look at some memorable moments from our plogging events and community activities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {galleryImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                <img
                  src={image.thumbnail_url || image.image_url || '/placeholder-image.png'}
                  alt={image.title}
                  className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/gallery">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                View Full Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section
        ref={el => sectionRefs.current[9] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-white w-full transition-all duration-700 transform ${
          visibleSections.has(9) 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-green-600 mr-2" />
              <h2 className="text-3xl md:text-4xl font-bold text-green-800">
                Latest Blog Posts
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read our latest articles on environmental conservation, plogging tips, and community events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-green-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <img
                  src={post.featured_image_url || '/placeholder-image.png'}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-800">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="mr-3">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{post.meta_data?.read_time || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/blog">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Read More Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section
        ref={el => sectionRefs.current[10] = el as HTMLDivElement | null}
        className={`py-12 md:py-16 px-4 bg-green-50 w-full transition-all duration-700 transform ${
          visibleSections.has(10) 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-green-600 mr-2" />
              <h2 className="text-3xl md:text-4xl font-bold text-green-800">
                Community Leaders
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our top volunteers who are making a difference in our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topVolunteers.map((volunteer, index) => (
              <div key={volunteer.volunteer_id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                        <span className="text-green-800 font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-green-800">
                          {volunteer.first_name} {volunteer.last_name}
                        </h3>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                        TOP
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-semibold">{volunteer.total_hours_contributed} hours</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{volunteer.events_attended} events</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{volunteer.badges_earned} badges</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/leaderboard-public">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                View Full Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section with transition */}
      <section
        ref={el => sectionRefs.current[11] = el as HTMLDivElement | null}
        className={`w-full flex flex-col items-center mt-12 md:mt-20 transition-all duration-700 delay-700 transform ${
          visibleSections.has(11)
            ? 'translate-y-0 opacity-100'
            : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="w-[90%] flex flex-col gap-4 md:gap-5">
          <h1 className="text-3xl md:text-5xl mb-6 md:mb-10 text-start">FAQ?</h1>

          {faqItems.map((item, index) => (
            <div key={index} className="w-full text-left">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="cursor-pointer bg-green-500/20 w-full px-4 py-3 md:px-5 md:py-4 flex justify-between items-center mb-3 md:mb-4"
              >
                <span className="font-none text-base md:text-lg text-gray-800">
                  {item.question}
                </span>
                <span className="text-xl md:text-2xl font-bold text-gray-800">
                  {openFaq === index ? "–" : "+"}
                </span>
              </button>

              {openFaq === index && (
                <div className="w-full px-4 py-2 md:px-5 md:py-2 bg-white text-base md:text-lg">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      
    </div>
  );
}