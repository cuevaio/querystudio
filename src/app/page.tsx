import { eq } from "drizzle-orm";
import { BarChart3, Building2, Plus, Zap } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { projects, projectsUsers } from "@/db/schema";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If not authenticated, show landing page
  if (!session?.user?.id) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="flex flex-1 items-center justify-center px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl">
              AI-Powered Market Analysis
            </h1>
            <p className="mb-8 text-muted-foreground text-xl sm:text-2xl">
              Transform your market research with intelligent competitor
              analysis and insights. Discover opportunities, track trends, and
              stay ahead of the competition.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="text-lg">
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-bold text-3xl">
              Everything you need for market intelligence
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary" />
                  <CardTitle>Smart Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    AI-driven analysis of market trends, competitor strategies,
                    and industry insights
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary" />
                  <CardTitle>Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track competitor activities, pricing changes, and market
                    movements as they happen
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Building2 className="h-10 w-10 text-primary" />
                  <CardTitle>Project Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Organize research by topics, manage multiple projects, and
                    collaborate with your team
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Get user's projects
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      description: projects.description,
      sector: projects.sector,
      region: projects.region,
      language: projects.language,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .innerJoin(projectsUsers, eq(projects.id, projectsUsers.projectId))
    .where(eq(projectsUsers.userId, session.user.id))
    .orderBy(projects.createdAt);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Manage your market research projects and track competitor insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="font-medium text-muted-foreground text-sm">
                    Total Projects
                  </p>
                  <p className="font-bold text-2xl">{userProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="font-medium text-muted-foreground text-sm">
                    Active Analyses
                  </p>
                  <p className="font-bold text-2xl">{userProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="font-medium text-muted-foreground text-sm">
                    This Month
                  </p>
                  <p className="font-bold text-2xl">
                    {
                      userProjects.filter((p) => {
                        const created = new Date(p.createdAt || "");
                        const now = new Date();
                        return (
                          created.getMonth() === now.getMonth() &&
                          created.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-2xl">Your Projects</h2>
            <Button asChild>
              <Link href="/create-project">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>

          {userProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold text-lg">
                    No projects yet
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Get started by creating your first market research project
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/create-project">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Project
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/${project.slug}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.sector && (
                          <Badge variant="secondary">{project.sector}</Badge>
                        )}
                        {project.region && (
                          <Badge variant="outline">{project.region}</Badge>
                        )}
                        {project.language && (
                          <Badge variant="outline">{project.language}</Badge>
                        )}
                      </div>
                      <p className="mt-4 text-muted-foreground text-xs">
                        Created{" "}
                        {new Date(project.createdAt || "").toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
