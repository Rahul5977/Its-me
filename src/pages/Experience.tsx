import React from 'react';
import { Calendar, MapPin, ExternalLink, Award, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import experienceData from '@/data/experience.json';

const Experience = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Experience & Education
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              My professional journey and academic background
            </p>
          </div>

          {/* Work Experience */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              Work Experience
            </h2>
            
            <div className="space-y-8">
              {experienceData.experience.map((exp, index) => (
                <Card key={exp.id} className="glass hover:shadow-medium transition-all">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl mb-2">{exp.title}</CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                          <span className="font-medium">{exp.company}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {exp.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="outline">{exp.duration}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{exp.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold">Key Achievements:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              Education
            </h2>
            
            <div className="space-y-6">
              {experienceData.education.map((edu, index) => (
                <Card key={index} className="glass hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.school}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {edu.location}
                          </div>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Focus: {edu.focus}
                        </p>
                      </div>
                      <Badge variant="outline">{edu.duration}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Award className="h-8 w-8 text-primary" />
              Certifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experienceData.certifications.map((cert, index) => (
                <Card key={index} className="glass hover:shadow-medium transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-2">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground">
                          Credential ID: {cert.credentialId}
                        </p>
                      </div>
                      <Badge variant="outline">{cert.date}</Badge>
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

export default Experience;