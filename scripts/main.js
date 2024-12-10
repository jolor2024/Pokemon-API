import { DotLottie } from "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm";

let listOfPokemons = [];
let rulesetMovesList = {}; 
const Pokemon = {
    id: 0,
    name: "",
    sprite: "",
    battleSprite: "",
    types: [],
    stats: {
        hp: 0,
        maxhp: 0,
        attack: 0,
        defense: 0,
        specialattack: 0,
        specialdefense: 0,
        speed: 0
    },
    possibleMoves: [],
    selectedMoves: [],
}

let team1 = [];
let team2 = [];


//Type chart. Vatten är bra mot eld osv.
function getTypeEffect(attackType, defendType) {
    const typeChart = {
        normal: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 0, dragon: 1, dark: 1
        },
        fire: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1, dark: 1
        },
        water: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1
        },
        electric: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 0.5, ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 1
        },
        grass: {
            normal: 1, fire: 0.5, water: 2, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 0.5, psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1, dark: 1
        },
        ice: {
            normal: 1, fire: 0.5, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 2, flying: 2, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 2, dark: 1
        },
        fighting: {
            normal: 2, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 2, ghost: 0, dragon: 1, dark: 2
        },
        poison: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1
        },
        ground: {
            normal: 1, fire: 1, water: 1, electric: 2, grass: 0.5, ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1
        },
        flying: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1, dark: 1
        },
        psychic: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 2, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 2
        },
        bug: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 2, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 0.5, psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 1, dark: 1
        },
        rock: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 0.5, flying: 2, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 1, dark: 1
        },
        ghost: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 2, dragon: 1, dark: 1
        },
        dragon: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1, psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2, dark: 1
        },
        dark: {
            normal: 1, fire: 1, water: 1, electric: 1, grass: 1, ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1, psychic: 0, bug: 2, rock: 1, ghost: 2, dragon: 1
        }
    };
    
    let effect = typeChart[attackType][defendType];
    if(effect == 2) {
        console.log("Super effective...");
    } else if(effect == 0.5) {
        console.log("Not effective...");
    } 
    return effect;
}

function isCriticalHit() {
    const rand = Math.floor(Math.random() * 16); //1 på  16 att det blir kritisk träff...
    if(rand == 0) {
        console.log("Critical hit!");
        return true;
    } else {
        return false;
    }
}

const pokedex = document.getElementById("pokedexTable");
const title = document.getElementById("titleinfo");
const gameScreen = document.getElementById("gameScreen");
const pokemonList = document.getElementById("pokemonList");


//Funktion för att hämta alla moves en pokemon kan göra:)
function getPokemons(from, to) {
    function addMoves(json) {
        let moves = [];
        json.moves.forEach(move => {
            move.version_group_details.forEach(version => {
                if(version.version_group.name == "yellow" && version.move_learn_method.name == "level-up") {
                    let moveObj = {};
                    moveObj["name"] = move.move.name;
                    moveObj["url"] = move.move.url;

                    //Kollar om det redan finns
                    const exists = moves.some(existingMove => existingMove.url === moveObj.url);
                    if (!exists) {
                        moves.push(moveObj);
                    }

                }
            });
        });
        
        return moves;  
    }
    
    let fetchPromises = [];
    let detailsMovePromises = [];

    pokedex.innerHTML = ""; //Ta bort tidigare valda generationer så inte dubletter.
    listOfPokemons.length = 0; //Ta bort tidigare valda generationer så inte dubletter.

    //Hämtar valda pokemons
    for(let i = from; i <= to; i++) {
        const url = "https://pokeapi.co/api/v2/pokemon/" + i;
        const fetchPromise = fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                const pokemon = Object.create(Pokemon);
                pokemon.id = json.id;
                pokemon.name = json.name;
                pokemon.sprite = json.sprites["front_default"];
                pokemon.battleSprite = json.sprites.other["showdown"]["front_default"];

                pokemon.stats = {};
                pokemon.types = [];
                json.types.forEach(type => {
                    pokemon.types.push(type.type.name);
                });
                
    
                pokemon.stats.hp = json.stats[0].base_stat;
                pokemon.stats.maxhp = json.stats[0].base_stat;
                pokemon.stats.attack = json.stats[1].base_stat;
                pokemon.stats.defense = json.stats[2].base_stat;
                pokemon.stats.specialattack = json.stats[3].base_stat;
                pokemon.stats.specialdefense = json.stats[4].base_stat;
                pokemon.stats.speed = json.stats[5].base_stat;
                


                pokemon.possibleMoves = addMoves(json);
                

        
                pokemon.possibleMoves.forEach(move => {
                    const addMoveDetails = fetch(move.url)
                        .then(response => response.json())
                        .then((json) => {
                            // Lägger till alla möjiga moves en pokemon kan ha
                            if (!rulesetMovesList.hasOwnProperty(move.name)) {
                                rulesetMovesList[move.name] = {
                                    "name" : move.name,
                                    "accuracy": json.accuracy,
                                    "power": json.power,
                                    "type": json.type.name
                                };
                            }
                        });

                        detailsMovePromises.push(addMoveDetails);
                });
                
                listOfPokemons.push(pokemon);
            });
               
            fetchPromises.push(fetchPromise);
    }
    
    //Väntar på alla requests sen starta allt.
    Promise.all(fetchPromises)
        .then(() => {
            console.log("Fetched all pokemons...");
            title.innerHTML = "Spelare 1 välj Pokemon";

            listOfPokemons.sort((a, b) => {
                return a.id - b.id;
            });

            //Krävs ha promise all här också för att vänta på alla moves som valts ut
            Promise.all(detailsMovePromises)
            .then(() => {
                listOfPokemons.forEach(pokemon => {
                    
                    pokemon.selectedMoves = [];

                    // Väljer ut 4st moves från alla möjliga
                    pokemon.possibleMoves.forEach(possibleMove => {
                        if(pokemon.selectedMoves.length < 4) {
                            pokemon.selectedMoves.push(rulesetMovesList[possibleMove.name]);
                        }
                        
                    });
                }); 

                listOfPokemons.forEach(pokemon => {
                    displayPokemonStart(pokemon);
                });
    
            })
            .catch((error) => {
                console.log("Error adding details moves:", error);
            });


            
        })
        .catch((error) => {
            console.log("Error fetching Pokémon data:", error);
        });
    
}


function displayPokemonStart(pokemon) {
    const pokemonDex = document.createElement("div");
    pokemonDex.classList.add("pokemonDex");
    const img = document.createElement("img");
    img.src = pokemon.sprite;

    img.addEventListener("click", function(e) {
        if(team1.length < 6) {
            if(team1.indexOf(pokemon) == -1 && team2.indexOf(pokemon) == -1) {
                team1.push(pokemon);
                img.classList.add("takenPlayer1");
            } else {
                if(team1.indexOf(pokemon) == -1) {
                    //Ta bort från listan?
                }
            }
            if(team1.length == 6) {
                title.innerHTML = "Spelare 2 välj Pokemon";
                title.style.color = "red";
            }
        } else {
            if(team2.length < 6) {
                if(team1.indexOf(pokemon) == -1 && team2.indexOf(pokemon) == -1) {
                    team2.push(pokemon);
                    img.classList.add("takenPlayer2");
                }
                if(team2.length == 6) {
                    title.remove();
                    pokemonList.remove();
                    battle();
                }
            } 
        }
    });

    pokemonDex.appendChild(img);
    pokedex.appendChild(pokemonDex);
}



const hpRemaining1 = document.getElementById("hpRemaining1");
let maxhp1;
let maxhp2;
const hpRemaining2 = document.getElementById("hpRemaining2");


const textinfo = document.getElementById("textinfo");


/* Battle logik */ 
async function battle() {
    
    gameScreen.style.display = "block";
    title.innerHTML = "";


    
    /*
    for(let i = 0; i < 6; i++) {  //för att testa
        team1.push(listOfPokemons[i+133]);
        team2.push(listOfPokemons[i+1]);
    }
    */


    gameScreen.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    
    
    //Kanske ändra detta till current pokemon istället?
    let team1Defeated = 0;
    let team2Defeated = 0;

    let player1Pokemon = team1[team1Defeated];
    let player2Pokemon = team2[team2Defeated];


    //Initiera dem första pokemons
    displayBattlePokemon(player1Pokemon, 1);
    displayBattlePokemon(player2Pokemon, 2);
    while(team1Defeated < 6 && team2Defeated < 6) {
        console.log("\n");
        console.log("Player 1's pokemon: " + player1Pokemon.name);
        console.log("Player 2's pokemon: " + player2Pokemon.name);


        //Ersätt detta med funktion samma kod för varje??? funktion för inner html (print?)

        let newText = document.createElement("p");

        newText.textContent = "Waiting for player 1...";
        textinfo.appendChild(newText);

        const player1Move = await setMoves(player1Pokemon, 1); 

        if(calculateMove(player1Move, player1Pokemon, player2Pokemon, 2)) {

            newText.textContent = player2Pokemon.name + " defeated...";
            textinfo.appendChild(newText);
            team2Defeated++;
            
            if(team2Defeated == 6) {
                newText.textContent = player2Pokemon.name + "Player 1 wins";
                textinfo.appendChild(newText);
                alert("Player 1 wins"); //Funktion hör
                location.reload();
                break;
            } else {
                player2Pokemon = team2[team2Defeated];
                displayBattlePokemon(team2[team2Defeated], 2); //Byter ikon men inte moves?
            }
            
        }

        //Händer något ex ditto har bara en attack. Ersätt alla till empty efter defeated...
        
        newText.textContent = player2Pokemon.name + "Waiting for player 2...";
        textinfo.appendChild(newText);
        const player2Move = await setMoves(player2Pokemon, 2); 

        if(calculateMove(player2Move, player2Pokemon, player1Pokemon, 1)) {
            newText.textContent = player1Pokemon.name + " defeated...";
            textinfo.appendChild(newText);
            team1Defeated++;

            if(team1Defeated == 6) {
                newText.textContent = player2Pokemon.name + "Player 2 wins";
                textinfo.appendChild(newText);
                alert("Player 2 wins!")
                location.reload();
                break;
            } else {
                player1Pokemon = team1[team1Defeated];
                displayBattlePokemon(player1Pokemon, 1); //Byter ikon men inte moves? reseta moves.. ex lapras ditto
            }
        } 


    }
    
}
 

function playAttackAnimation(moveType, playerDefender) {
    const attackAnimations = {
        fire: "../animation/fire.json", 
        water: "../animation/water.json", 
        grass: "../animation/grass.json", 
        electric: "../animation/thunder.json", 
        ice: "../animation/snowfall.json",
        bug: "../animation/bug.json", 
        dragon: "../animation/dragon.json", 
        psychic: "../animation/ghost.json",
        dark: "../animation/dark.json", 
        fighting: "../animation/hit.json",
        ground: "../animation/hit.json",
        rock: "../animation/hit.json",
        poison: "../animation/bug.json", 
        ghost: "../animation/ghost.json", 
        normal: "../animation/hit.json", 
        flying: "../animation/flying.json",
    };

    let elementName;
    if(playerDefender == 1) {
        elementName = "canvas1";
    } else if(playerDefender == 2) {
        elementName = "canvas2";
    }
    console.log(moveType + " attacked " + playerDefender);
    const lottie = new DotLottie({
      autoplay: true,
      loop: false,
      canvas: document.getElementById(elementName),
      src: attackAnimations[moveType], 
    });

    lottie.canvas.style.display = "block";
    

    setTimeout(() => {
        lottie.canvas.style.display = "none";
        lottie.destroy();
    }, 2000);
}

//Här beräknas varje attack osv
function calculateMove(move, attacker, defender, playerDefender) {
    playAttackAnimation(move.type, playerDefender);

    let newText = document.createElement("p");
    let baseDamage = move.power;
    if(baseDamage == null) { 
        baseDamage = 0; //Temporärt för attacker som inte har "damage", 
    } 


    //Kanske även fler typer?, argument 2?
    let effectType = getTypeEffect(move.type, defender.types[0]); // effekten av vatten mot eld osv
    
    if(effectType == 2) {
        newText.textContent = "Super effective!";
        textinfo.appendChild(newText);
    } else if(effectType == 0.5) {
        newText.textContent = "Not very effective!";
        textinfo.appendChild(newText);
    }

    if(isCriticalHit()) {
        effectType *= 2; //Dubblera attacken om kritisk träff
    }

    let finalDamage = baseDamage * effectType;

    newText.textContent = attacker.name + " dealt " + finalDamage + " damage.";
    textinfo.appendChild(newText);
    
    //Maxhp
    defender.stats.hp -= finalDamage;


    if(defender.stats.hp <= 0 ) {
        return true;
    } else {
        newText.textContent = defender.name + " now has " + defender.stats.hp + " hp.";
        textinfo.appendChild(newText);
        updateHP(defender.stats.maxhp, defender.stats.hp, playerDefender);
        return false;
    }
}


const player1moves = [
    document.getElementById("move1p1"),
    document.getElementById("move2p1"),
    document.getElementById("move3p1"),
    document.getElementById("move4p1")
];

const player2moves = [
    document.getElementById("move1p2"),
    document.getElementById("move2p2"),
    document.getElementById("move3p2"),
    document.getElementById("move4p2")
];



function updateHP(maxhp, remainderHP, player) {
    let hpPercentage;
    if(player == 1) {
        hpPercentage = (remainderHP/maxhp)*100;
        hpRemaining1.style.width = hpPercentage + "%";
    } else if(player == 2) {
        hpPercentage = (remainderHP/maxhp)*100;
        hpRemaining2.style.width = hpPercentage + "%";
    }
}

async function setMoves(pokemon,player) {
    function moveClicked(moveButtons, moves) {
        return new Promise((resolve) => {
            moveButtons.forEach((button, index) => {
                button.addEventListener("click", () => {
                    resolve(moves[index]);
                });
            });
        });
    }
    
    //Sätter all disabled för att sen aktivera dem valda moves
    for(let i = 0; i < 4; i++) {
        player1moves[i].disabled = true;
        player2moves[i].disabled = true;
    }
   

    let moves = pokemon.selectedMoves;

    let player1Promises = [];
    let player2Promises = [];
    for(let i = 0; i < moves.length; i++) {
        if(player == 1) {
            player1moves[i].innerHTML = moves[i].name;
            player1moves[i].disabled = false;
            //Här enabla.
            player1Promises.push(moveClicked(player1moves, pokemon.selectedMoves));
        } else if(player == 2) {
            player2moves[i].innerHTML = moves[i].name;
            player2moves[i].disabled = false;
            //Här enablda
            player2Promises.push(moveClicked(player2moves, pokemon.selectedMoves));
        }
    }  

    let moveSelected;
    if(player == 1) {
        moveSelected = await Promise.any(player1Promises);
    } else if(player == 2) {
        moveSelected = await Promise.any(player2Promises);
    }

    return moveSelected;
}
//Display pokemon when switching in or starting
function displayBattlePokemon(pokemon, player) {

    const pokemon1Title = document.getElementById("pokemonName1");
    const pokemon2Title = document.getElementById("pokemonName2");
    
    const pokemon1Img = document.getElementById("pokemon1Sprite");
    const pokemon2Img = document.getElementById("pokemon2Sprite");
    
   

    if(player == 1) {
        pokemon1Img.src = pokemon.battleSprite;
        pokemon1Title.innerHTML = pokemon.name.toUpperCase();
        updateHP(pokemon.stats.hp, pokemon.stats.hp, 1);
        
        //Empty moves
        player1moves.forEach(element => {
            element.innerHTML = "empty";
        });    
        setMoves(pokemon, player);
        
    } else if(player == 2) {
        pokemon2Img.src = pokemon.battleSprite;
        pokemon2Title.innerHTML = pokemon.name.toUpperCase();
        updateHP(pokemon.stats.hp, pokemon.stats.hp, 2);
        //Empty moves
        player2moves.forEach(element => {
            element.innerHTML = "empty";
        });
        setMoves(pokemon, player);
    }
}


const generation = document.getElementById("generation-select");
generation.addEventListener("change", function(e) {
    
    if(this.value == "gen1") {
        getPokemons(1, 151);
    } else if(this.value == "gen2") {
        
        getPokemons(152, 251);
    } else if(this.value == "gen3") {
        
        getPokemons(252, 386); 
    }
})
