import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateConvention, getDocuments } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);

type ConventionForm = {
  companyName: string;
  companyAddress: string;
  representativeFirstName: string;
  representativeLastName: string;
  representativeRole: string;
  trainingName: string;
  duration: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  instructor: string;
  participants: string;
  amountHt: string;
  conventionDate: string;
};

export function CreateConvention({
  companies,
}: {
  companies: { id: number; name: string }[];
}) {
  const [form, setForm] = useState<ConventionForm>({
    companyName: "",
    companyAddress: "",
    representativeFirstName: "",
    representativeLastName: "",
    representativeRole: "",
    trainingName: "",
    duration: "",
    dateStart: today,
    dateEnd: today,
    location: "Montpellier",
    instructor: "Laurent Serre",
    participants: "",
    amountHt: "",
    conventionDate: today,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments({ docType: "convention" });
      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const updateField = <K extends keyof ConventionForm>(
    key: K,
    value: ConventionForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await generateConvention(form);
      toast.success("Convention generee et archivee.");
      if (result?.blobUrl) {
        window.open(result.blobUrl, "_blank", "noopener,noreferrer");
      }
      await loadDocuments();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Generer une convention</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Entreprise cliente</Label>
            <Input
              list="company-list"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Nom de l'entreprise"
              required
            />
            <datalist id="company-list">
              {companies.map((company) => (
                <option key={company.id} value={company.name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label>Adresse de l'entreprise</Label>
            <Input
              value={form.companyAddress}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              placeholder="Adresse complete"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prenom du representant</Label>
              <Input
                value={form.representativeFirstName}
                onChange={(e) =>
                  updateField("representativeFirstName", e.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nom du representant</Label>
              <Input
                value={form.representativeLastName}
                onChange={(e) =>
                  updateField("representativeLastName", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qualite du representant</Label>
            <Input
              value={form.representativeRole}
              onChange={(e) => updateField("representativeRole", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Nom de la formation</Label>
            <Input
              value={form.trainingName}
              onChange={(e) => updateField("trainingName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Duree de la formation</Label>
            <Input
              value={form.duration}
              onChange={(e) => updateField("duration", e.target.value)}
              placeholder="Ex: 40 heures"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de debut</Label>
              <Input
                type="date"
                value={form.dateStart}
                onChange={(e) => updateField("dateStart", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={form.dateEnd}
                onChange={(e) => updateField("dateEnd", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lieu</Label>
              <Input
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Intervenant</Label>
              <Input
                value={form.instructor}
                onChange={(e) => updateField("instructor", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participants (un par ligne ou separes par virgules)</Label>
            <Textarea
              value={form.participants}
              onChange={(e) => updateField("participants", e.target.value)}
              placeholder="Alice Dupont\nBob Martin"
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Montant HT</Label>
              <Input
                value={form.amountHt}
                onChange={(e) => updateField("amountHt", e.target.value)}
                placeholder="6950"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date de la convention</Label>
              <Input
                type="date"
                value={form.conventionDate}
                onChange={(e) => updateField("conventionDate", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generation..." : "Generer la convention"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Conventions archivees</h3>
        <div className="space-y-2 text-sm">
          {documents.length === 0 && (
            <p className="text-muted-foreground">
              Aucune convention archivee pour le moment.
            </p>
          )}
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded border px-3 py-2"
            >
              <div>
                <div className="font-medium">{doc.fileName}</div>
                <div className="text-muted-foreground">
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleString("fr-FR")
                    : ""}
                </div>
              </div>
              <a
                href={doc.blobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Telecharger
              </a>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
