import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import story1 from "/story-1.png";
import { formatEthiopianPhoneNumber } from '@/utils/phoneFormatter';

const faqs = [
  {
    question: "What is Plogging?",
    answer:
      "Plogging is a fitness and environmental activity that combines jogging with picking up litter. It's a fun and impactful way to stay active while contributing to a cleaner environment.",
  },
  {
    question: "How can I join a Plogging event?",
    answer:
      "Joining a Plogging event is easy! Check our calendar for upcoming events in your area. Simply show up on the designated day with comfortable clothing, sturdy shoes, and a pair of gloves. Participation is free!",
  },
  {
    question: "Do I need to register for events?",
    answer:
      "Registration is not mandatory, but it helps us plan for the number of participants. You can register for events on our website or simply join us on the day of the event.",
  },
  {
    question: "Can groups participate in Plogging events?",
    answer:
      "Absolutely! We encourage groups from schools, associations, organizations, and friends to join our events. It's an excellent opportunity to bond, strengthen relationships, and contribute to a healthier community.",
  },
  {
    question: "Is there an age limit for participation?",
    answer:
      "Plogging is inclusive, and participants of all ages are welcome! We encourage families, youth, and seniors to join us in making a positive impact.",
  },
  {
    question: "What do I need to bring to a Plogging event?",
    answer:
      "Come with comfortable clothing, suitable shoes for jogging, and a pair of gloves. We provide bags for collecting litter.",
  },
  {
    question: "How often do you organize Plogging events?",
    answer:
      "We organize events every Saturday and Sunday. Check our calendar for specific dates and locations.",
  },
  {
    question: "Can I organize a Plogging event in my area?",
    answer:
      "Absolutely! We welcome individuals and groups to organize Plogging events. Reach out to us, and we'll provide guidance and support.",
  },
  {
    question: "Do you provide certificates or recognition for participants?",
    answer:
      "While we don't provide certificates, we appreciate and recognize the efforts of all participants. Your contribution to a cleaner environment is a reward in itself!",
  },
  {
    question: "How can I stay updated on upcoming events and news?",
    answer:
      "Stay connected by following us on social media, and regularly check our website for updates, event announcements, and inspiring stories.",
  },
];

const Membership = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Format the phone number as the user types
    const formattedPhone = formatEthiopianPhoneNumber(inputValue);
    setPhone(formattedPhone);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!agree) {
      toast({
        title: "Registration Failed",
        description: "You must agree to the terms and policy.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Registration Failed",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authRegister({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone, // This will now be in +251 format
        password
      });
      
      toast({
        title: "Registration Successful",
        description: "Welcome to Plogging Ethiopia! Your account has been created.",
      });
      
      // Navigate to dashboard after successful registration
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="start"
      className="flex flex-col items-center gap-20 w-[90%] pb-10 mx-auto"
    >
      <div className="w-full flex flex-col gap-5 items-center">
        <h1 className="text-5xl pb-4 border-b-2 w-fit">Membership</h1>
        <p className="text-xl">
          Join our community of passionate individuals dedicated to fostering a
          healthier environment through plogging.
        </p>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-10">
        <img src={story1} className="w-full" alt="member" />
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Plogging Ethiopia
            </CardTitle>
            <CardDescription>
              Environmental Care + Community Wellness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">
              Register as Volunteer
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+251 ..."
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">Please enter your phone number in +251 format</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="h-4 w-4 text-green-600 rounded"
                />
                <Label htmlFor="agree" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the terms and policy
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-green-600 font-medium hover:text-green-800"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="w-[90%] flex flex-col gap-5">
        <h1 className="text-5xl mb-10">FAQ?</h1>
        {faqs.map((faq, index) => (
          <div className="w-full text-left" key={index}>
            <div
              className="cursor-pointer bg-green-500/20 w-full px-5 py-2 flex justify-between"
              onClick={() => toggleFaq(index)}
            >
              {faq.question}
              <p>{openFaq === index ? "-" : "+"}</p>
            </div>
            <div
              className="w-full px-5"
              style={{ display: openFaq === index ? "block" : "none" }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Membership;