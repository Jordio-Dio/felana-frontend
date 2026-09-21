import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Search, UserX, Users } from "lucide-react";
import { clientService } from "@/api/clientService";
import type { Client } from "@/types/client.types";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { notify } from "@/lib/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getInitials(nom: string, prenom: string | null): string {
  const first = prenom?.[0] ?? "";
  const second = nom?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export function ClientsListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const page = await clientService.findAll({ size: 200 });
      setClients([...page.content].sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Erreur lors du chargement des clients :", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) => {
      const fullName = `${client.prenom ?? ""} ${client.nom}`.toLowerCase();
      return (
        fullName.includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.telephone?.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await clientService.remove(deleteTarget.id);
      setDeleteTarget(null);
      loadClients();
      notify.success("Client supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression du client :", error);
      notify.error("Impossible de supprimer ce client.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* En-tête de la page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F2E6E1] pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Répertoire Clients
          </h2>
          <p className="text-xs text-stone-500">
            Consultez et gérez les fiches d'information de vos clients.
          </p>
        </div>
        <CreateClientDialog onCreated={loadClients} />
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B3A1C]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, e-mail, téléphone..."
          className="h-10 rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 pl-10 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C] transition-colors"
        />
      </div>

      {/* Liste des clients */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4]/50 p-4"
              />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#F2E6E1] bg-[#FAF6F4]/30 py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10 mb-3">
              {search ? <UserX className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              {search ? "Aucun client trouvé" : "Aucun client enregistré"}
            </h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm">
              {search
                ? "Aucune fiche client ne correspond à votre recherche actuelle."
                : "Ajoutez votre premier client pour commencer à organiser votre annuaire."}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ListItemCard
              key={client.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F4] text-xs font-bold text-[#8B3A1C] border border-[#F2E6E1]">
                  {getInitials(client.nom, client.prenom)}
                </div>
              }
              title={`${client.prenom ? client.prenom + " " : ""}${client.nom}`}
              subtitle={client.email ?? undefined}
              fields={[
                { label: "Téléphone", value: client.telephone ?? "—" },
                { label: "Adresse", value: client.adresse ?? "—" },
              ]}
              actions={
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-[#FAF6F4] hover:text-stone-700 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-lg bg-stone-900 text-[11px] text-white">
                      Plus d'options
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#F2E6E1] p-1 shadow-lg">
                    <DropdownMenuItem
                      onClick={() => setEditTarget(client)}
                      className="rounded-lg text-xs font-medium text-stone-700 cursor-pointer focus:bg-[#FAF6F4] focus:text-stone-900"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5 text-stone-500" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(client)}
                      className="rounded-lg text-xs font-medium text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-700"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))
        )}
      </div>

      {/* Dialog d'édition du client */}
      <EditClientDialog
        client={editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onUpdated={loadClients}
      />

      {/* Confirmation de suppression */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl border-[#F2E6E1] bg-white p-6 shadow-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-stone-900">
              Supprimer la fiche client ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-stone-600 leading-relaxed">
              {deleteTarget && (
                <>
                  Vous êtes sur le point de supprimer la fiche de{" "}
                  <strong className="text-stone-900">
                    {deleteTarget.prenom ? `${deleteTarget.prenom} ` : ""}
                    {deleteTarget.nom}
                  </strong>
                  . Cette action est définitive et irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-9 rounded-xl border-[#F2E6E1] text-xs text-stone-600 hover:bg-[#FAF6F4]"
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="h-9 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
            >
              {isDeleting ? "Suppression..." : "Confirmer la suppression"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}