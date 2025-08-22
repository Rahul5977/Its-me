import React from 'react';
import { Download, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import personalData from '@/data/personal.json';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              About Me
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get to know the person behind the code
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative">
                <img
                  src={personalData.avatar}
                  alt={personalData.name}
                  className="w-64 h-64 rounded-2xl object-cover shadow-medium"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>

            {/* Bio Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Hi, I'm {personalData.name}</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                    {personalData.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {personalData.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Available for freelance
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button 
                      size="lg" 
                      className="text-primary-foreground hover:neon-glow transition-all"
                      asChild
                    >
                      <a href={personalData.resume} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Drives Me</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "I believe in pushing boundaries and exploring new technologies to solve complex problems.",
                icon: "🚀"
              },
              {
                title: "Quality",
                description: "Writing clean, maintainable code and following best practices is always my priority.",
                icon: "💎"
              },
              {
                title: "Growth",
                description: "Continuous learning and improvement, both personally and professionally.",
                icon: "📈"
              }
            ].map((value, index) => (
              <Card key={index} className="glass hover:shadow-medium transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;