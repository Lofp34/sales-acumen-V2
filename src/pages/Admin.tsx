import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Copy, Check, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CreateQuiz } from "@/components/Admin/CreateQuiz";
import {
  getCompanies, createCompany,
  getQuizzes,
  getSessions, createSession, getResults
} from "@/lib/api";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [companies, setCompanies] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  // New Item States
  const [newCompanyName, setNewCompanyName] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [newSessionData, setNewSessionData] = useState({ companyId: "", quizId: "" });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'companies' || activeTab === 'sessions') {
        const c = await getCompanies();
        setCompanies(c);
      }
      if (activeTab === 'quizzes' || activeTab === 'sessions') {
        const q = await getQuizzes();
        setQuizzes(q);
      }
      if (activeTab === 'sessions' || activeTab === 'dashboard') {
        const s = await getSessions();
        setSessions(s);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erreur chargement données");
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName) return;
    try {
      await createCompany(newCompanyName);
      toast.success("Entreprise créée");
      setNewCompanyName("");
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionData.companyId || !newSessionData.quizId) return;
    try {
      await createSession(Number(newSessionData.companyId), Number(newSessionData.quizId));
      toast.success("Session créée");
      setCreatingSession(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/start/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Lien copié: " + url);
  };

  const downloadResults = async (sessionId: number, quizTitle: string) => {
    try {
      const data = await getResults(sessionId);
      if (!data.results || data.results.length === 0) {
        return toast.warning("Aucun résultat pour cette session");
      }

      let csv = "Nom,Email,Score,Date\n";
      data.results.forEach((r: any) => {
        const date = new Date(r.participant.completedAt).toLocaleDateString();
        csv += `"${r.participant.name}","${r.participant.email}","${r.participant.score}","${date}"\n`;
      });

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Resultats_${quizTitle}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } catch (e: any) {
      toast.error("Erreur export: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Accueil
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Administration</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="quizzes">Questionnaires</TabsTrigger>
            <TabsTrigger value="companies">Entreprises</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6">
                <h3 className="font-medium text-sm text-muted-foreground">Sessions Actives</h3>
                <p className="text-3xl font-bold">{sessions.filter(s => s.status === 'active').length}</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-medium text-sm text-muted-foreground">Total Quizzes</h3>
                <p className="text-3xl font-bold">{quizzes.length || '-'}</p>
              </Card>
            </div>
            {/* Recent activity or something could go here */}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Sessions de formation</h2>
                <div className="flex gap-2">
                  {!creatingSession ? (
                    <Button onClick={() => setCreatingSession(true)}><Plus className="w-4 h-4 mr-2" /> Nouvelle Session</Button>
                  ) : (
                    <div className="flex gap-2 items-center bg-background p-2 border rounded shadow-sm">
                      <select
                        className="border rounded p-1 text-sm"
                        value={newSessionData.companyId}
                        onChange={e => setNewSessionData({ ...newSessionData, companyId: e.target.value })}
                      >
                        <option value="">Choisir Entreprise</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select
                        className="border rounded p-1 text-sm"
                        value={newSessionData.quizId}
                        onChange={e => setNewSessionData({ ...newSessionData, quizId: e.target.value })}
                      >
                        <option value="">Choisir Quiz</option>
                        {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                      </select>
                      <Button size="sm" onClick={handleCreateSession}>Créer</Button>
                      <Button size="sm" variant="ghost" onClick={() => setCreatingSession(false)}>X</Button>
                    </div>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Lien Apprenant</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.companyName || session.companyId}</TableCell>
                      <TableCell>{session.quizTitle || session.quizId}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyLink(session.slug)}>
                            <Copy className="w-3 h-3 mr-2" /> Lien
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => downloadResults(session.id, session.quizTitle)}>
                            <Download className="w-3 h-3 mr-2" /> CSV
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(session.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{session.status}</TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune session</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <CreateQuiz onCreated={loadData} />

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bibliothèque de Questionnaires</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Créé le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map(q => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.title}</TableCell>
                      <TableCell>{q.description}</TableCell>
                      <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="companies">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Entreprises / Clients</h2>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nom de l'entreprise..."
                  value={newCompanyName}
                  onChange={e => setNewCompanyName(e.target.value)}
                  className="max-w-sm"
                />
                <Button onClick={handleCreateCompany}><Plus className="w-4 h-4 mr-2" /> Ajouter</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Créé le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
