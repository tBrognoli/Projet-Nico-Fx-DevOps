
       //VARIABLES
//JQUERY
$("#ecran_ip").show();
$("#ItStart").show();
$("#ecran_infos").hide();
$("#ecran_bot").hide();
$("#chargement1").hide();
$("#chargement2").hide();
$("#chargement3").hide();
$("#chargement4").hide();
$("#fenetre").html("<h3>Ip</h3>");
$("#alerte").hide();
$("#erreur").hide();


$("#infos").click(function() {

$("#ecran_ip").hide();
$("#ecran_bot").hide();
$("#ecran_infos").show(1000);
$("#fenetre").html("<h3>Infos</h3>");
});


$("#bot").click(function() {

$("#ecran_ip").hide();
$("#ecran_infos").hide();
$("#ecran_bot").show(1000);
$("#fenetre").html("<h3>Bot</h3>");
});

$("#ip").click(function() {

$("#ecran_infos").hide();
$("#ecran_bot").hide();
$("#ecran_ip").show(1000);
$("#fenetre").html("<h3>Ip</h3>");
});

//JAVASCRIPT

//verifIP
var ipAccept = true;                                                //dis si l'adresse IP est correcte ou non
var ipEntre = [0,0,0,0];                                            //IP entré par l'utilisateur
//calculPlageIp
var saut;                                                           //taille d'un sous-réseaux permettant l'incrémentation
var NbSSR;                                                          //Nombre de sous-réseaux dans la plage
var Nb;
var plageIp = {
        SSR: [],                                                    //adresse IP du sous-réseau
        premierHote: [],                                            //adresse IP du premier
        dernierHote: [],                                            //adresse IP du dernier hôte
        broadcast: [],                                               //adresse IP de Broadcast
        ipNextSSR: [],
};
var listSSR = [0,0,0,0];                                            //variable du sous-reseau (liste afin de connaitre son emplacement) 
var cidr = 0;                                                       //cidr
//calculMasque
var masqueList = [0,0,0,0];                                         //masque de l'adresse IP rentré
var possibleMasqueList = [0,254,252,248,240,224,192,128,0];         //masque possible != 255
var compteur = 0;                                                   //compteur dans la boucle de calcul du masque
var queZero = false;                                                //savoir à partir de quand le masque n'a que des zeros
//random
var randomCompteur = 0;                                             //fait tourner l'affichage random
var loadingCompteur = 0;                                            //fait tourner le chargement
var nbHoteBot;
var bot_ok=true;


        //FONCTION BACK

//ACTIVE CALCULS SUR PAGE IP

function valideIp(){
    verifIp();
      if(ipAccept === false){ 
        clignotant();
        $("#erreur").show();                           //NON message d'erreur
    }   else{
            $("#erreur").hide();
            $("#alerte").hide();                       //OUI message de confirmation + lance le calcule du masque
            reset();
            calculMasque(cidr);
            calculPlageIp(cidr,ipEntre);
            random();
    }
};

//ACTIVE CALCULS SUR PAGE BOT

function activationBot(){
    document.getElementById("resultatBot").innerHTML = "";
    Bot();
};

//VERIFIE SI @IP VALIDE

function verifIp(){
    ipAccept = true;                    //vérifie si l'adresse IP rentre dans les critères
    if(ipEntre[0] > 255 || ipEntre[1] > 255 || ipEntre[2] > 255 || ipEntre[3] > 255 || ipEntre[0] < 0 || ipEntre[1] < 0 || ipEntre[2] < 0 || ipEntre[3] < 0 || cidr > 31 || cidr < 8){
        ipAccept = false;
    }   else{
            if(ipEntre[0] < 10){
                ipAccept = false;
            }   else{
                    if(ipEntre[0] > 10 && ipEntre[0] < 172){
                        ipAccept = false;
                    }   else{
                            if(ipEntre[0] == 172 && ipEntre[1] < 16 ){
                                ipAccept = false;
                            }   else{
                                    if(ipEntre[0] == 172 && ipEntre[1] > 31){
                                        ipAccept = false;
                                    }   else{
                                            if(ipEntre[0] > 172 && ipEntre[0] < 192){
                                                ipAccept = false;
                                            }   else{
                                                    if(ipEntre[0] == 192 && ipEntre[1] < 168){
                                                        ipAccept = false;
                                                    }   else{
                                                            if(ipEntre[0] == 192 && ipEntre[1] > 168){
                                                                ipAccept = false;
                                                            }   else{
                                                                    if(ipEntre[0] > 192){
                                                                        ipAccept = false;
                                                                    }
                                                            }
                                                    }
                                            }
                                    }
                            }
                    }
            }
    }   
};

//RÉINITIALISE VARIABLES POUR ANIMATION

function reset(){
    cpt = 0;
    randomCompteur = 0;
    loadingCompteur = 0;
    $("#chargement1").hide();
    $("#chargement2").hide();
    $("#chargement3").hide();
    $("#chargement4").hide();
};

//CALCUL LE MASQUE SOUS RÉSEAU

function calculMasque(champagne){
    queZero = false; 
    for(compteur = 0 ; compteur<4 ; compteur++){
        if(queZero == false){
            champagne = champagne - 8;                                                                    //passe a l'octet suivant
            if(champagne >= 0){                                                                           //si est positif => mettre 255 
                masqueList[compteur] = 255;
            }   else{                                                                                     //sinon negatif => regarde dans la liste le masque correspondant
                    champagne = champagne* -1;
                    masqueList[compteur] = possibleMasqueList[champagne];
                    queZero = true;                                                                       //met desormais que des zeros
            }
        }   else{                                                                                         //met des zeros dans tout les octets restants
                masqueList[compteur] = 0;
        }
    }
    
};

//CALCUL PLAGE @IP DU RÉSEAU

function calculPlageIp(cidrYolo, ipYolo){
    Nb = Math.pow(2,(32-cidrYolo));                                                                                //calcule d'adresse IP total
    saut=31-cidrYolo+1; 
    while (saut>8) {                                                                                           //Reduit le cidr afin d'atteindre la puissance correspondante
        saut=saut-8;
    }
    saut = Math.pow(2,saut);
    NbSSR = 256/saut; 

    if (cidrYolo>=24){                                                                                             //si cidr >= 24  -->  influe sur le 4eme octet
        listSSR[3] = (Math.trunc(ipYolo[3]/saut))*saut;
        plageIp.SSR = [ipYolo[0],ipYolo[1],ipYolo[2],listSSR[3]];
        plageIp.premierHote = [ipYolo[0],ipYolo[1],ipYolo[2],(listSSR[3]+1)];
        plageIp.dernierHote = [ipYolo[0],ipYolo[1],ipYolo[2],(listSSR[3]+saut-2)];
        plageIp.broadcast = [ipYolo[0],ipYolo[1],ipYolo[2],(listSSR[3]+saut-1)];
    } 
        else if (cidrYolo>=16){                                                                                    //si cidr >= 16  --> influe sur le 3eme octet
            listSSR[2]= (Math.trunc(ipYolo[2]/saut)*saut);
            plageIp.SSR = [ipYolo[0],ipYolo[1],listSSR[2],listSSR[3]];
            plageIp.premierHote = [ipYolo[0],ipYolo[1],listSSR[2],(listSSR[3]+1)];
            plageIp.dernierHote = [ipYolo[0],ipYolo[1],(listSSR[2]+saut-1),254];
            plageIp.broadcast =[ipYolo[0],ipYolo[1],(listSSR[2]+saut-1),255];
        }
            else if (cidrYolo>=8){                                                                                 //si cidr >= 8  --> influe sur le 2eme octet
                listSSR[1] = (Math.trunc(ipYolo[1]/saut)*saut);
                plageIp.SSR = [ipYolo[0],listSSR[1],listSSR[2],listSSR[3]];
                plageIp.premierHote = [ipYolo[0],listSSR[1],listSSR[2],(listSSR[3]+1)];
                plageIp.dernierHote = [ipYolo[0],(listSSR[1]+saut-1),255,254];
                plageIp.broadcast = [ipYolo[0],(listSSR[1]+saut-1),255,255];
            }
    plageIp.ipNextSSR = [plageIp.broadcast[0], plageIp.broadcast[1], plageIp.broadcast[2], plageIp.broadcast[3]+1];
    if(plageIp.ipNextSSR[3] < 256){                                                                         //Incrémente D jusqu'a D == 256
        plageIp.ipNextSSR[3]++;
    }

    if(plageIp.ipNextSSR[3] == 256 && plageIp.ipNextSSR[2] <256){                                                           //Si D == 256 et C < 256
        plageIp.ipNextSSR[3] = 0;                                                                               //D==0
        plageIp.ipNextSSR[2]++;                                                                            //Incrémente C jusqu'a C == 256
    }

    if(plageIp.ipNextSSR[2] == 256 && plageIp.ipNextSSR[1] <256){                                                           //Si C == 256 et B < 256
        plageIp.ipNextSSR[2] = 0;                                                                               //C==0
        plageIp.ipNextSSR[1]++;                                                                             //Incrémente B jusqu'a B == 256
    }

    if(plageIp.ipNextSSR[1] == 256 && plageIp.ipNextSSR[0]<256){                                                            //Si B == 256 et A < 256
        plageIp.ipNextSSR[1] = 0;                                                                               //B==0
        plageIp.ipNextSSR[0]++;                                                                             //Incrémente A jusqu'a A==256
    }
};

//RÉCUPERE DONNÉES ENTRÉES

function recupIp(id){
    document.getElementById(id).value=document.getElementById(id).value.replace(/\D/g,'');          //retire tout caractère != chiffre 
    if(id == "nbHoteBot"){
        nbHoteBot = parseInt(document.getElementById(id).value);
    }   else{
            if(id == "tailleSSR"){
                tailleSSR = parseInt(document.getElementById(id).value);
            }   else{
                    if(id == "cidr"){                                                                               //si id==cidr alors ca ecrit dans la variable cidr
                        cidr = parseInt(document.getElementById(id).value);
                    }   else{                                                                                       //sinon ecrit dans l'adresse IP en fonction de la place donné par l'ID
                            ipEntre[id] = parseInt(document.getElementById(id).value);
                    }
            }
    }
};

//CALCUL PAGE BOT

function Bot(){
    var ipBot = [];                                                                             //Variable ip
    var nbSSRBot = 0;                                                                           //Nombre de sous réseaux
    var resteBot = 0;                                                                           //Nombre d'hotes perdus
    var messagePerdu = "";                                                                      //Message d'erreur
    if (nbHoteBot > 16387064){                                                                  //Si User demande + d'hôtes que possible
        alert("Nombre d'hôte demandé trop élevé.");                                                      //On l'envoit chier
        return;
    }

    if (nbHoteBot < 16387064 && nbHoteBot > 967740) {                                           //Détermine ip à use selon nbHote
        ipBot = [10, 0, 0, 0];                                                                  //Classe A
    }

    if (nbHoteBot < 967740 && nbHoteBot > 64516) {                                              //Détermine ip à use selon nbHote
        ipBot = [172, 16, 0, 0];                                                                //Classe B
    }

    if (nbHoteBot < 64516 && nbHoteBot > 0) {                                                   //Détermine ip à use selon nbHote
        ipBot = [192, 168, 0, 0];                                                               //Classe C
    }
    
    if (document.getElementById("pourcentage").checked == true) {                                                                  //Si User veut 15% d'hôtes en plus
        tailleSSR *= 1.15;                                                                      //Les rajoutes
    }

    
    nbSSRBot = Math.trunc(nbHoteBot/tailleSSR);                                                 //Détermine nombre de ssRéseaux 
    resteBot =  nbHoteBot % tailleSSR;                                                           //Nb hotes restant
    if (tailleSSR>nbHoteBot){
        bot_ok=false;
        clignotant();
        }else if (tailleSSR<nbHoteBot){
        $("#alerte").hide(); 
        bot_ok=true;
    }

    nbBitReseau =0;                                                         
    j=0;                                                                //Détermine le CIDR à prendre par rapport au nombre d'hôtes par SSR
    while((tailleSSR +2) >= Math.pow(2, j) ) {                          //Tant que Nombre d'hôte 2 ne rentre pas dans 2 puissance j
        j += 1;                                                         //Incrémente J
        nbBitReseau = 32 -j;                                            //CIDR
        if ((tailleSSR + 2) <= Math.pow(2, j)) {                        //Si NbHote est inférieur à 2 puissance j
            break;                                                      //Sort de la boucle afin qu'il ne relance pas le while une derniere fois
        }
    }
    

    i=0;
    pasDe = 0;
    while (nbSSRBot > 0){                                                   //Tant qu'il reste des Sous réseaux à créer
        if (i > 0) {                                                        //Tant ce n'est pas le premier Sous réseaux
            ipBot = [plageIp.ipNextSSR[0],plageIp.ipNextSSR[1],plageIp.ipNextSSR[2],plageIp.ipNextSSR[3]];                                    //On prends la prochaine Ip de sous réseau donnée par fonction
        }
        
        i++;
        nbSSRBot -=1;
        calculMasque(nbBitReseau);
        calculPlageIp(nbBitReseau, ipBot);                                //Lance la fonction déterminant la plage avec la nouvelle ip
        document.getElementById("resultatBot").innerHTML = document.getElementById("resultatBot").innerHTML +"Plage IP n°" + i + "<br/>" + "Adresse Sous-Réseau : " + plageIp.SSR + "<br/>" + "   Premier hôte : " + plageIp.premierHote + "<br/>" + "   Dernier hôte : " + plageIp.dernierHote + "<br/>" + "Adresse Broadcast : " + plageIp.broadcast + "<br/>" + "Masque sous réseaux : " + masqueList + "<br/><br/>";
    }
};


        //ANIMATION - FRONT

//BARRE DE CHARGEMENT

var cpt = 0;
var fin_chargement=false;

function loading(){ 
    var temps_chargement = setTimeout("loading()",700);
    cpt=cpt+1;
    $("#chargement"+cpt).show();
    if(cpt == 5){
        cpt = 0;
        $("#chargement1").hide();
        $("#chargement2").hide();
        $("#chargement3").hide();
        $("#chargement4").hide();
        clearTimeout(temps_chargement);
    }
};

//DEFILEMENT TEXTE

var position=0;
var msg="IT START U X[periment]";
var msg="     "+msg;
var longueurText=msg.length;
var fois=(403/msg.length)+1;
for(i=0;i<=fois;i++){
    msg+=msg;
};
function defilement() {
    document.getElementById("textdef").value=msg.substring(position,position+403);
    position++;
    if(position == longueurText) position=0;
        setTimeout("defilement()",200); 
};

//AFFICHAGE HEURE ET DATE

//heure
function calculHeure(){
    setTimeout("calculHeure()",15000);
    var date = new Date();
    var heure = date.getHours();
    var minutes = date.getMinutes();
    if(minutes < 10){
        minutes = "0" + minutes;
    }
    document.getElementById("spanHeure").innerHTML = heure + "h" + minutes;
};
//date
var maintenant=new Date();
document.getElementById("spanDate").innerHTML= maintenant.getDate() + "/" + (maintenant.getMonth()+1) + "/" + maintenant.getFullYear();

//DEFILEMENT IMAGES

function randomImg(){
   document.getElementById('troll').src = "troll" + Math.round(Math.random()*11+1) + ".png";
   setTimeout("randomImg()",5000); 
};

//FAIT CLIGNOTEMENT

function clignotant(){
    $("#alerte").toggle();
    if(ipAccept === false || bot_ok===false){
        setTimeout("clignotant()",500);
    }   else{
            $("#alerte").hide();
    }
};

//CHIFFRES DEFILANT

function random(){
    if(randomCompteur < 100){
        var aleatoireNbSSR = Math.floor(Math.random() * 99);
        document.getElementById("NbSSR0").innerHTML = aleatoireNbSSR;
    }   else{
            document.getElementById("NbSSR0").innerHTML = NbSSR;
    }

    if(randomCompteur < 110){
        var aleatoireNb = Math.floor(Math.random() * 9999);
        document.getElementById("Nb0").innerHTML = aleatoireNb;
    }   else{
            document.getElementById("Nb0").innerHTML = Nb-2;
    }
    if(randomCompteur < 115){
        var aleatoiremasque = Math.floor(Math.random() * 9999);
        document.getElementById("mask").innerHTML = aleatoiremasque;
    }   else{
        document.getElementById("mask").innerHTML = masqueList[0] + " . " + masqueList[1] + " . " + masqueList[2] + " . " + masqueList[3];
    }
    if(randomCompteur < 120){
        var aleatoirePrHote0 = Math.floor(Math.random() * 999);
        document.getElementById("PrHote0").innerHTML = aleatoirePrHote0;
    }   else{
            document.getElementById("PrHote0").innerHTML = plageIp.premierHote[0];
    }
    if(randomCompteur < 130){
        var aleatoirePrHote1 = Math.floor(Math.random() * 999);
        document.getElementById("PrHote1").innerHTML = aleatoirePrHote1;
    }   else{
            document.getElementById("PrHote1").innerHTML = plageIp.premierHote[1];
    }
    if(randomCompteur < 140){
        var aleatoirePrHote2 = Math.floor(Math.random() * 999);
        document.getElementById("PrHote2").innerHTML = aleatoirePrHote2;
    }   else{
            document.getElementById("PrHote2").innerHTML = plageIp.premierHote[2];
    }
    if(randomCompteur < 150){
        var aleatoirePrHote3 = Math.floor(Math.random() * 999);
        document.getElementById("PrHote3").innerHTML = aleatoirePrHote3;
    }   else{
            document.getElementById("PrHote3").innerHTML = plageIp.premierHote[3];
    }
    if(randomCompteur < 160){
        var aleatoireDrHote0 = Math.floor(Math.random() * 999);
        document.getElementById("DrHote0").innerHTML = aleatoireDrHote0;
    }   else{
            document.getElementById("DrHote0").innerHTML = plageIp.dernierHote[0];
    }
    if(randomCompteur < 170){
        var aleatoireDrHote1 = Math.floor(Math.random() * 999);
        document.getElementById("DrHote1").innerHTML = aleatoireDrHote1;
    }   else{
            document.getElementById("DrHote1").innerHTML = plageIp.dernierHote[1];
    }
    if(randomCompteur < 180){
        var aleatoireDrHote2 = Math.floor(Math.random() * 999);
        document.getElementById("DrHote2").innerHTML = aleatoireDrHote2;
    }   else{
            document.getElementById("DrHote2").innerHTML = plageIp.dernierHote[2];
    }
    if(randomCompteur < 190){
        var aleatoireDrHote3 = Math.floor(Math.random() * 999);
        document.getElementById("DrHote3").innerHTML = aleatoireDrHote3;
    }   else{
            document.getElementById("DrHote3").innerHTML = plageIp.dernierHote[3];
    }
    if(randomCompteur < 200){
        var aleatoireSSR0 = Math.floor(Math.random() * 999);
        document.getElementById("SSR0").innerHTML = aleatoireSSR0;
    }   else{
            document.getElementById("SSR0").innerHTML = plageIp.SSR[0];
    }
    if(randomCompteur < 210){
        var aleatoireSSR1 = Math.floor(Math.random() * 999);
        document.getElementById("SSR1").innerHTML = aleatoireSSR1;
    }   else{
            document.getElementById("SSR1").innerHTML = plageIp.SSR[1];
    }
    if(randomCompteur < 220){
        var aleatoireSSR2 = Math.floor(Math.random() * 999);
        document.getElementById("SSR2").innerHTML = aleatoireSSR2;
    }   else{
            document.getElementById("SSR2").innerHTML = plageIp.SSR[2];
    }
    if(randomCompteur < 230){
        var aleatoireSSR3 = Math.floor(Math.random() * 999);
        document.getElementById("SSR3").innerHTML = aleatoireSSR3;
    }   else{
            document.getElementById("SSR3").innerHTML = plageIp.SSR[3];
    }
    if(randomCompteur < 240){
        var aleatoireBroadcast0 = Math.floor(Math.random() * 999);
        document.getElementById("broadcast0").innerHTML = aleatoireBroadcast0;
    }   else{
            document.getElementById("broadcast0").innerHTML = plageIp.broadcast[0];
    }
    if(randomCompteur < 250){
        var aleatoireBroadcast1 = Math.floor(Math.random() * 999);
        document.getElementById("broadcast1").innerHTML = aleatoireBroadcast1;
    }   else{
            document.getElementById("broadcast1").innerHTML = plageIp.broadcast[1];
    }
    if(randomCompteur < 260){
        var aleatoireBroadcast2 = Math.floor(Math.random() * 999);
        document.getElementById("broadcast2").innerHTML = aleatoireBroadcast2;
    }   else{
            document.getElementById("broadcast2").innerHTML = plageIp.broadcast[2];
    }
    if(randomCompteur < 270){
        setTimeout("random()",20);
        var aleatoireBroadcast3 = Math.floor(Math.random() * 999);
        document.getElementById("broadcast3").innerHTML = aleatoireBroadcast3;
    }   else{
            document.getElementById("broadcast3").innerHTML = plageIp.broadcast[3];
    }


    if(loadingCompteur == 67){
        cpt=cpt+1;
        $("#chargement"+cpt).show();
        loadingCompteur = 0; 
    }

    loadingCompteur = loadingCompteur + 1;
    randomCompteur = randomCompteur + 1;
};