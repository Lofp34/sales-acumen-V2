import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, Shield, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-hover mb-6">
            <ClipboardList className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Plateforme Ovea
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Évaluation des compétences en pilotage commercial et performance des équipes de vente
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="p-8 hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Passer le questionnaire</h2>
            <p className="text-muted-foreground mb-6">
              Évaluez vos connaissances sur le pilotage commercial suite à l'atelier Ovea
            </p>
            <Link to="/quiz">
              <Button size="lg" className="w-full">
                Commencer l'évaluation
              </Button>
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Administration</h2>
            <p className="text-muted-foreground mb-6">
              Consultez les résultats et exportez les données archivées
            </p>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="w-full">
                Accéder au tableau de bord
              </Button>
            </Link>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Archivage sécurisé</h3>
            <p className="text-sm text-muted-foreground">
              Tous les résultats sont archivés et conformes aux normes qualité
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Suivi en temps réel</h3>
            <p className="text-sm text-muted-foreground">
              Consultez les statistiques et identifiez les points à renforcer
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Export facilité</h3>
            <p className="text-sm text-muted-foreground">
              Exportez les données au format CSV pour vos rapports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
