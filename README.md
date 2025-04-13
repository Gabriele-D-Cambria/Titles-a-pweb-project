# 1. Titles

Il gioco si basa su combattimenti nel classico stile _Pokémon_, ma con mosse, strumenti, statistiche e stile dei personaggi più vicino a realtà simili a _D&D_.

Ogni account avrà a disposizione la generazione di un massimo di 5 personaggi (da ora _PG_).
Le statistiche di ogni _PG_ sono le seguenti:
- **Forza** `FOR`: indica quanto danno di base faranno gli attacchi del personaggio, senza considerare eventuali bonus/malus.
- **Destrezza** `DEX`: indica la probabilità di schivare un'attacco del personaggio 
  La probabilità spazierà dallo 0% al minimo fino al 60% al massimo,  per evitare scontri troppo difficili
Ogni volta che si subisce un attacco il "tiro" per la schivata avviene automaticamente.
- **Punti Vita** `PF`
- **Elementale**: ogni PG ha un proprio elemento a scelta tra (_acqua_, _fuoco_, _terra_, _elettro_, _aria_).
 Esiste il concetto di _prevalenza_ su un'altro elemento. 
    Quando un elemento _prevale_ sull'altro, i danni da lui effettuati hanno un bonus `+1`, inoltre chi viene attaccato **ha dimezzate le possibilità di schivare**.
    Ogni elemento fornisce dei bonus fissi al _PG_, vedere la tabella (1) dopo.
    Per _allineamento_ si intende che l'elemtale del _PG_ e dello strumento combaciano.
    Per _opposto_ si intede che l'elementale dello strumento _prevale_ su quello _PG_
- **Armatura**: diminuisce la quantità di danni subita.
  Le armature hanno un loro archetipo elementare:
    - Se _allineato_ all'elemento del _PG_ fornisce `-2` ai danni subiti
    - Se _opposto_ all'elemento del _PG_ rimuove le eventuali prevalenze dell'avversario sull'elemento del _PG_
    - Se _neutro_ non ha effetti
- **Arma**: ogni personaggio avrà un'arma.
  Le armi possono fornire i suoi bonus e malus.
  Sono sbloccate tramite _box_ ricompensa. 
  Anche le armi hanno un loro archetipo elementare:
    - Se _allineato_ all'elemento del _PG_ fornisce `+2` ai danni effettuati
    - Se _opposto_ all'elemento del _PG_ fornisce prevalenza anche sull'elemento stesso del _PG_ (acqua + arma elettro $\overset{\text{prevale}}{\to}$ fuoco e acqua )
    - Se _neutro_ non ha effetti secondari
- **Oggetti**: ogni personaggio potrà portarsi in battaglia fino a un massimo di `5` oggetti nello zaino che possono essere utilizzati al posto di un'azione. 
Gli oggetti forniscono _buff_ temporanei alle statistiche o permettono di recuperare vita, e una volta utilizzati vengono persi definitivamente. 


I valori di `FOR` e `DEX` sono di default `0` ma possono variare in un intervallo che va da `-10` e `+10`.
I valori hanno i valori di riferimento della tabella (2).
Di default ogni personaggio ha `25 PF`

Ogni account ha un _livello_, della _esperienza_ (_exp_) e delle _monete_.
L'esperienza si guadagna effettuando battaglie.
Il quantitativo di esperienza guadagnata è fissato a:
- `+5` per le sconfitte
- `+15` per le vittorie

Arrivati a `100` punti _exp_ si effettua il **passaggio di livello** (_level-up_) del personaggio.
Il _level-up_ consiste in:
- Guadagno di `40` monete
- Guadagno di `+3` _punti upgrade_
- Assegnamento di 1 box comune

Le _monete_ possono essere guadagnate nei seguenti modi:
- Effettuando battaglie;
- Scartando oggetti;
- Come ricompensa dalle _box_;

Ogni account ha un suo inventario di oggetti non assegnati contenente fino ad un massimo di `40` oggetti non assegnati che possono essere assegnati ai vari _PG_.
Quando un oggetto viene assegnato ad un _PG_ viene rimosso dall'inventario dell'account.
L'assegnamento al _PG_ non è definitivo, infatti è possibile rimuovere un'oggetto da un _PG_ per riportarlo all'inventario dell'_account_.
Gli oggetti possono essere scartati per ottenere in monete la metà del loro valore.

Gli oggetti si categorizzano in:
- _Armi_
- _Armature_
- _Pozioni_
- _Box_

Le _box_ possono essere acquistate dal negozio o si ottengono vincendo partite.
Nelle `box comuni` si trova:
- `5`-`10` monete 
- `2` oggetti tra armi e armature
- `1` pozione


Nelle `box rare` si trova:
- `15`-`20` monete
- `2` armi
- `2` armature
- `2` pozioni



Informazioni sulle armi:
| Nome               | Descrizione                        | Elemento | Tipologia | Costo | Danno | ModificatoreFor  | ModificatoreDex  |
|--------------------|------------------------------------|----------|-----------|-------|-------|------------------|------------------|
| Spada d'Acqua      | Una spada affilata e leggera.      | Acqua    | arma      | 20    | 6     | 2                | 1                |
| Spada di Fuoco     | Una spada infuocata.               | Fuoco    | arma      | 30    | 8     | 0                | 1                |
| Mazza di Terra     | Una mazza pesante e robusta.       | Terra    | arma      | 30    | 8     | 1                | 0                |
| Bastone Elettrico  | Un bastone che emette elettricità. | Elettro  | arma      | 25    | 7     | 1                | 1                |
| Pugnale d'Aria     | Un pugnale leggero e veloce.       | Aria     | arma      | 20    | 6     | 1                | 2                |

Informazioni sull'armatura:
| Nome               | Descrizione             | Elemento | Tipologia | Costo | Armatura |  ModificatoreFor  | ModificatoreDex  |
|--------------------|-------------------------|----------|-----------|-------|----------|-------------------|------------------|
| Armatura d'Acqua   | Leggera e impermeabile. | Acqua    | armatura  | 40    | 4        | -1                |  0               |
| Armatura di Fuoco  | Resistente al calore.   | Fuoco    | armatura  | 40    | 4        |  0                | -1               |
| Armatura di Terra  | Robusta e pesante.      | Terra    | armatura  | 45    | 5        | -1                | -2               |
| Armatura Elettrica | Robusta e conduttiva.   | Elettro  | armatura  | 45    | 5        | -2                | -1               |
| Armatura d'Aria    | Leggera e flessibile.   | Aria     | armatura  | 35    | 3        |  0                |  0               |


Informazioni sulle pozioni:
| Nome                 | Descrizione                                       | Elemento | Tipologia | Costo | RecuperoVita  | ModificatoreFor | ModificatoreDex |
|----------------------|---------------------------------------------------|----------|-----------|-------|---------------|-----------------|-----------------|
| Pozione di Vita      | Ripristina 20 PF.                                 | NULL     | pozione   | 15    | 20            | 0               | 0               |
| Pozione di Energia   | Ripristina 10 PF.                                 | NULL     | pozione   | 10    | 10            | 0               | 0               |
| Pozione di Forza     | Aumenta la forza temporaneamente di 3 punti.      | NULL     | pozione   |  8    | 0             | 3               | 0               |
| Pozione di Destrezza | Aumenta la destrezza temporaneamente di 3 punti.  | NULL     | pozione   |  8    | 0             | 0               | 3               |

Informazioni sulle box:
| Nome               | Descrizione                     | Elemento | Tipologia | Costo | Danno | Armatura | RecuperoVita | ModificatoreFor | ModificatoreDex |
|--------------------|---------------------------------|----------|-----------|-------|-------|----------|---------------|------------------|------------------|
| Box Comune         | Contiene monete, pozione, 2 oggetti (armi e/o armature). | NULL     | box       | 50    | 0     | 0        | 0             | 0                | 0                |
| Box Rara           | Contiene monete, 2 pozioni, 2 armi e 2 armature. | NULL     | box       | 100    | 0     | 0        | 0             | 0                | 0                |

Tabella (1)
|Elementale|FOR |DEX | PF |Totale|Prevale|Prevalsa da|
|:--------:|:--:|:--:|:--:|:----:|:-----:|:---------:|
|_Acqua_   |`-3`|`+2`|`+5`| `+4` |Fuoco  |  Elettro  |
|_Fuoco_   |`+4`|`+3`|`-3`| `+4` |Aria   |   Acqua   |
|_Terra_   |`+0`|`-2`|`+6`| `+4` |Elettro|    Aria   |
|_Elettro_ |`+6`|`+0`|`-2`| `+4` |Acqua  |   Terra   |
|_Aria_    |`-1`|`+6`|`-1`| `+4` |Terra  |   Fuoco   |

Tabella (2)
|          |FOR - Danni|DEX - % schivata|
|---------:|:---------:|:--------------:|
|`-10`/`-9`|    `0`    |      `0%`      |
|`-8`/`-7` |    `1`    |     `10%`      |
|`-6`/`-5` |    `2`    |     `15%`      |
|`-4`/`-3` |    `3`    |     `20%`      |
|`-2`/`-1` |    `4`    |     `25%`      |
|`+0`/`+1` |    `5`    |     `30%`      |
|`+2`/`+3` |    `6`    |     `35%`      |
|`+4`/`+5` |    `7`    |     `40%`      |
|`+6`/`+7` |    `8`    |     `45%`      |
|`+8`/`+9` |    `9`    |     `50%`      |
|  `+10`   |    `10`   |     `60%`      |
