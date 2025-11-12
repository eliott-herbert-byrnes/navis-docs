import { onboardingPath, signInPath } from "@/app/paths";
import { Heading } from "@/components/Heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionUser, getUserOrgWithRole } from "@/lib/auth";
import { BarChart3, Bot, CheckCircle2, Clock, Smartphone, Zap } from "lucide-react";
import { redirect } from "next/navigation";

const DemoPage = async () => {
  const user = await getSessionUser();
  if (!user) redirect(signInPath());

  const {org, isAdmin} = await getUserOrgWithRole(user.userId);
  if (!org) redirect(onboardingPath());
  if (!isAdmin) redirect(signInPath()); 

  return (
    <>
      <Heading
        title="Demo & Product Guide"
        description="Learn how Navis Docs works, explore core features, and discover what's coming next"
      />
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What is Navis Docs?</CardTitle>
              <CardDescription>
                Your centralized process documentation and knowledge management platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Navis Docs is an enterprise process documentation system designed to help teams maintain, organize, 
                and share standard operating procedures (SOPs). With built-in AI assistance, version control, and 
                comprehensive audit trails, Navis Docs ensures your team always has access to current, accurate processes.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Process Management</h4>
                    <p className="text-xs text-muted-foreground">Create, edit, and publish processes with version control</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">AI-Powered Search</h4>
                    <p className="text-xs text-muted-foreground">Ask the AI assistant questions about your processes</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Error Tracking</h4>
                    <p className="text-xs text-muted-foreground">Report and manage process documentation errors</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Complete Audit Trail</h4>
                    <p className="text-xs text-muted-foreground">Track who changed what, when, and why</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">🎯 Standardization</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure consistent processes across departments and teams by centralizing all documentation.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">🤖 AI Assistance</h4>
                <p className="text-sm text-muted-foreground">
                  Find answers instantly without searching through pages of documentation.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">📊 Data-Driven Improvements</h4>
                <p className="text-sm text-muted-foreground">
                  Track error reports and ideas to identify where processes need improvement.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">🔍 Accountability</h4>
                <p className="text-sm text-muted-foreground">
                  Complete audit logs show exactly who made changes and when, ensuring compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEATURES TAB */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Core Features</CardTitle>
              <CardDescription>Everything you need to manage processes effectively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-base mb-2">📝 Process Editor</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create and edit processes in multiple formats:
                </p>
                <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
                  <li><strong>RAW</strong> - Free-form rich text for flexible content</li>
                  <li><strong>STEPS</strong> - Numbered sequences for linear workflows</li>
                  <li><strong>FLOW</strong> - Visual flowcharts for complex decision trees</li>
                  <li><strong>YES/NO</strong> - Interactive decision trees for guided workflows</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-base mb-2">🤖 AI Chat Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Ask natural language questions about your processes. The AI searches your documentation using 
                  semantic search and provides accurate answers with source citations. Perfect for quick lookups 
                  and training new team members.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-base mb-2">🐛 Error Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  Users can report documentation issues directly from each process. Track status (Open, Resolved, 
                  Archived) and use error data to identify which processes need updates most urgently.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-base mb-2">💡 Ideas & Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Collect improvement suggestions from team members. Track ideas through stages (New, In Progress, 
                  Completed, Archived) to implement continuous improvement in your processes.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-base mb-2">📰 Team News & Announcements</h3>
                <p className="text-sm text-muted-foreground">
                  Publish important updates for your teams. Pin announcements to ensure critical information 
                  stays visible, and keep everyone informed about process changes.
                </p>
              </div>

              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-base mb-2">📊 Audit Logs</h3>
                <p className="text-sm text-muted-foreground">
                  Complete, immutable record of all actions: who created/edited what, when changes were made, 
                  and what was changed. Essential for compliance and accountability.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-base mb-2">⭐ Favorites</h3>
                <p className="text-sm text-muted-foreground">
                  Bookmark frequently-used processes for quick access. Personalize your dashboard with your most-referenced procedures.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORGANIZATION TAB */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
              <CardDescription>How Navis Docs structures your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <div className="space-y-3 font-mono text-sm">
                  <div>📦 Organization (Your Company)</div>
                  <div className="ml-6">└─ 🏢 Department (e.g., Operations, Compliance)</div>
                  <div className="ml-12">└─ 👥 Team (e.g., Account Services, Fraud Detection)</div>
                  <div className="ml-18">└─ 📄 Processes</div>
                  <div className="ml-24">├─ 📂 Categories (Payment Processing, Account Management, etc.)</div>
                  <div className="ml-24">└─ 📝 Process Versions (Draft → Published)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>Organization structure and admin features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge>Organization Owner</Badge>
                </div>
                <p className="text-sm text-muted-foreground ml-0">
                  Full access to all features. Can invite users, manage subscriptions, and configure organization settings.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Admin</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can manage processes, users, error reports, ideas, and view audit logs. Responsible for process governance.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Member</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Can view processes, use AI chat assistant, report errors, and submit improvement ideas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">1. Create Departments</h4>
                <p className="text-sm text-muted-foreground">
                  From Home, create departments that match your organizational structure.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">2. Add Teams</h4>
                <p className="text-sm text-muted-foreground">
                  Within each department, create teams responsible for specific functions.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">3. Create Processes</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Create Process" in your team to start documenting SOPs.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">4. Publish & Share</h4>
                <p className="text-sm text-muted-foreground">
                  Once satisfied with a process, publish it to make it available to your team members.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">5. Invite Team Members</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Invite section to onboard team members to your organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROADMAP TAB */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Roadmap</CardTitle>
              <CardDescription>Upcoming features and improvements coming to Navis Docs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-blue-900 dark:text-blue-100">Mobile-Optimized UI</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Responsive redesign optimized for mobile and tablet devices. Access processes and use the AI 
                      assistant from anywhere with fully touch-friendly interfaces. Offline support for critical processes coming soon.
                    </p>
                    <Badge className="mt-3 bg-blue-600">In Development</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-purple-900 dark:text-purple-100">Agentic AI Integration</h3>
                    <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                      Intelligent background processes powered by AI agents that automatically:
                    </p>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 mt-2 ml-4 list-disc space-y-1">
                      <li>Analyze and categorize error reports to identify systemic process issues</li>
                      <li>Generate suggested improvements based on error patterns and team feedback</li>
                      <li>Detect anomalies in audit logs and flag suspicious activities</li>
                      <li>Auto-tag ideas and errors for faster triage and prioritization</li>
                      <li>Suggest process consolidation opportunities to reduce redundancy</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-green-900 dark:text-green-100">Advanced Analytics Dashboard</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      Comprehensive insights into process performance and team engagement:
                    </p>
                    <ul className="text-sm text-green-800 dark:text-green-200 mt-2 ml-4 list-disc space-y-1">
                      <li>Process usage metrics and adoption rates</li>
                      <li>Error trends and resolution times</li>
                      <li>Most accessed processes and AI chat patterns</li>
                      <li>Team member engagement and contribution metrics</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-orange-900 dark:text-orange-100">Workflow Automation & Integrations</h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                      Connect Navis Docs with your existing tools:
                    </p>
                    <ul className="text-sm text-orange-800 dark:text-orange-200 mt-2 ml-4 list-disc space-y-1">
                      <li>Webhook support for custom integrations</li>
                      <li>Slack notifications for process updates and error reports</li>
                      <li>Microsoft Teams integration</li>
                      <li>Calendar sync for process training schedules</li>
                      <li>API endpoints for programmatic access</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-cyan-50 dark:bg-cyan-950 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-cyan-900 dark:text-cyan-100">Process Version Diff & Comparison</h3>
                    <p className="text-sm text-cyan-800 dark:text-cyan-200 mt-1">
                      Side-by-side comparison of process versions showing exactly what changed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-pink-50 dark:bg-pink-950 rounded-lg border border-pink-200 dark:border-pink-800">
                  <CheckCircle2 className="h-5 w-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-pink-900 dark:text-pink-100">Process Certifications & Training Tracking</h3>
                    <p className="text-sm text-pink-800 dark:text-pink-200 mt-1">
                      Track team member training completion, certification status, and knowledge assessments. 
                      Ensure compliance with process training requirements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Feedback & Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Have an idea or suggestion? Submit it in the <strong>Ideas</strong> section! Your feedback directly 
                influences our product roadmap and helps us build features that matter most to your team.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default DemoPage;
