import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';
import skillsData from '@/data/skills.json';

const Skills = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Skills & Technologies
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive overview of my technical expertise and proficiency levels
            </p>
          </div>

          {/* Skills Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {skillsData.categories.map((category) => {
              const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<any>;
              
              return (
                <Card key={category.name} className="glass hover:shadow-medium transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {category.skills.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{skill.icon}</span>
                            <span className="font-medium">{skill.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {skill.level}%
                          </Badge>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Skills */}
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-12">Additional Expertise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Software Architecture",
                  skills: ["Microservices", "Design Patterns", "System Design", "API Design"],
                  icon: "🏗️"
                },
                {
                  title: "Project Management",
                  skills: ["Agile/Scrum", "Team Leadership", "Code Review", "Mentoring"],
                  icon: "📋"
                },
                {
                  title: "Testing & Quality",
                  skills: ["Unit Testing", "Integration Testing", "TDD", "Code Quality"],
                  icon: "🧪"
                }
              ].map((area, index) => (
                <Card key={index} className="glass hover:shadow-medium transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{area.icon}</div>
                    <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
                    <div className="space-y-2">
                      {area.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="mr-2 mb-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
};

export default Skills;