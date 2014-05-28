$(function(){
    $("#mysched").dhx_scheduler({
        xml_date:"%Y-%m-%d %H:%i",
        date:new Date(2009,4,25),
        mode:"month"
    });
 
    scheduler.load();
});