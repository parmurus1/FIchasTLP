import { criarPericiasPadrao } from "@/lib/calculos";
import type { FichaData } from "@/types/database";

export function criarFichaBase(nome: string): FichaData {
  return {
    ancestralidade: "",
    heranca: "",
    classe: "",
    escola: "",
    talento_classe: "",
    biografia: "",
    nivel: 1,
    avatar_url: undefined,
    atributos: { FOR: 10, DES: 10, CON: 10, INT: 10, CAR: 10 },
    pericias: criarPericiasPadrao(),
    habilidades: [],
    idiomas: ["Comum"],
    inventario: [],
    dinheiro: { PC: 0, PP: 0, PO: 0, PPl: 0 },
    combate: {
      pv_atual: 10,
      pv_maximo: 10,
      pv_temporario: 0,
      ca: 10,
      iniciativa_bonus: 0,
      condicoes: [],
      testes_morte: { sucessos: 0, falhas: 0 },
    },
    sanidade: 5,
    corrupcao: 0,
    reputacao: [],
    notas: "",
  };
}
