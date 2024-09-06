test("", ()=>{

    const g = ["Geokey_v1", "Geokey_v2", "Geokey_v100", "Geokey_v1000"];
    g.sort((a, b) => a.localeCompare(b));
    console.log(g); 
});