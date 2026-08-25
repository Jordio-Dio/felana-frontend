import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
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
      setClients(page.content);
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
      notify.success("Client supprimé.");
    } catch (error) {
      console.error("Erreur lors de la suppression du client :", error);
      notify.error("Impossible de supprimer ce client.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500">Gérez les fiches de vos clients.</p>
        </div>
        <CreateClientDialog onCreated={loadClients} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          className="rounded-full pl-9"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-400">Chargement...</p>
        ) : filteredClients.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            {search ? "Aucun client ne correspond à la recherche." : "Aucun client pour le moment."}
          </p>
        ) : (
          filteredClients.map((client) => (
            <ListItemCard
              key={client.id}
              leading={
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-600">
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
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditTarget(client)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteTarget(client)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))
        )}
      </div>

      <EditClientDialog
        client={editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onUpdated={loadClients}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Vous êtes sur le point de supprimer la fiche de{" "}
                  <strong>
                    {deleteTarget.prenom ? `${deleteTarget.prenom} ` : ""}
                    {deleteTarget.nom}
                  </strong>
                  . Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      
    </div>
  );
}