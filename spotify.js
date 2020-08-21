class Element{
    constructor(data){
        this.data=data;
        this.parent=0;
    }
  }
  
  class Noduplicate{
    constructor(data){
        this.ar=[];
        let element=new Element(data);
        this._root=element;
        this.ar.push(data);
    }
    addElement(id) {
        this.ar.push(id);
    }
    check(id) {
        return this.ar.includes(id);
    }
  }
let  id1;
let id2;
let token;
const startPoint=getEl("start");
const endPoint=getEl("end");
const display=getEl("disp");
const direct=getEl("green");
function getEl(idVal) {
    return document.getElementById(idVal);
}

async function getToken() {
  const result=await fetch("https://accounts.spotify.com/api/token",{
    method:'POST',
    headers:{
      'Content-Type':'application/x-www-form-urlencoded',
      'Authorization':'Basic '+btoa(clienId+":"+clientSecret)
    },
    body: 'grant_type=client_credentials'
  });
  const data=await result.json();
  return data.access_token;
}

async function convertNameToId() {
  disp.innerHTML="loading...";
  token=await getToken();
  const obj1=await getId(startPoint.value);
  const obj2=await getId(endPoint.value);
  id1=obj1.artists.items[0].id;
  id2=obj2.artists.items[0].id;
  startEval();
}

async function getId(id) {
    console.log(id);
    const resultOne=await fetch(`https://api.spotify.com/v1/search?q=${id}&type=artist`,{
    method:'GET',
    headers:{
      'Authorization':'Bearer '+token
    }
  });
  const jsonObj=await resultOne.json();
  return jsonObj;
}

async function relatedArtists(id) {
  const result=await fetch("https://api.spotify.com/v1/artists/"+id+"/related-artists",{
    method:'GET',
    headers:{
      'Authorization':'Bearer '+token
    }
  });
  const data=await result.json();
  return data.artists;
}

async function convertToId(id) {
  const result=await fetch("https://api.spotify.com/v1/artists/"+id,{
    method:'GET',
    headers:{
      'Authorization':'Bearer '+token
    }
  });

  const data=await result.json();
  return data.name;

}

function startEval() {
  const ds=new Noduplicate(id1)
  let artists;
  let toParse=[];
  toParse.push(ds._root);
  let curr=toParse.shift();
  loopFunc(curr, ds,  artists, toParse);
}
async function loopFunc(curr, ds, artists, toParse) {
    if(curr.data==id2) {
        let artist=[];
        let m=0;
        display.innerHTML="";
        direct.innerHTML="";
        while(curr.parent!==0){
            artist=(await convertToId(curr.parent.data));
            display.innerHTML=("<span>"+artist+"</span>"+"<img src='down.png'>"+display.innerHTML);
            curr=curr.parent;
            m++;
        }
        display.innerHTML+=endPoint.value;
        startPoint.value="";
        endPoint.value="";
        if(m==1)
            direct.innerHTML="Directly Related";
    }
    else {
      artists=await relatedArtists(curr.data);  
      let parent=curr;
      let child;
  
      for (let i = 0; i < artists.length; i++) {
          console.log(1);
          if(!ds.check(artists[i].id)) {
              console.log(2);
              child = new Element(artists[i].id);
              child.parent = parent;
              toParse.push(child);
              ds.addElement(artists[i].id);
          }
      }
      curr=toParse.shift();
      loopFunc(curr, ds, artists, toParse);
    }
}