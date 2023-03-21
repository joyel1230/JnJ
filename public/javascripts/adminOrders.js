let statusB = document.getElementsByClassName('statusB')
let deliverB = document.getElementsByClassName('deliverB')
let cancelB = document.getElementsByClassName('cancelB')
let returnB = document.getElementsByClassName('returnB')
let mainB = document.getElementsByClassName('mainB')

for(let i=0;i<statusB.length;i++){
    if(statusB[i].innerHTML.trim()==='payment pending' || statusB[i].innerHTML.trim()==='Cancelled' 
    || statusB[i].innerHTML.trim()==='Delivered' || statusB[i].innerHTML.trim()==='Returned'
     || statusB[i].innerHTML.trim()==='Return processing'){
        deliverB[i].style.display = 'none'
        cancelB[i].style.display = 'none'
        mainB[i].style.display = 'none'
    }
}
 for(let i=0;i<statusB.length;i++){
    if(statusB[i].innerHTML.trim()!=='Return processing'){
        returnB[i].style.display = 'none'
    }else{
        mainB[i].style.display = 'inline'
    }
}


function canConR(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del2');
    pop[i].classList.remove('open-pop');
    return false;
}
function canConR2(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del3');
    pop[i].classList.remove('open-pop');
    return false;
}
function canConR1(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del1');
    pop[i].classList.remove('open-pop');
    return false;
}
function deliCon(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del1');
    pop[i].classList.add('open-pop');
    return false;
}
function canCon(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del2');
    pop[i].classList.add('open-pop');
    return false;
}
function retCon(i) {
    i=Number(i)
    let pop = document.getElementsByClassName('del3');
    pop[i].classList.add('open-pop');
    return false;
}

// function htmlToPdf() {
//     var doc = new jsPDF();          
// var elementHandler = {
//   '#ignorePDF': function (element, renderer) {
//     return true;
//   },
//   '#ignorePDF1': function (element, renderer) {
//     return true;
//   }
// };
// var source = window.document.getElementsByTagName("table")[0];
// doc.fromHTML(
//     source,
//     15,
//     15,
//     {
//         'width': 'auto', // set to desired width
//         'elementHandlers': elementHandler,
//         'scaleFactor': 0.5 // adjust to scale table down as needed
//       });

// doc.output("dataurlnewwindow");
// }

// $(document).ready(function() 
// { 
//     $('#example').DataTable( 
//     {             
//         "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
//         dom: 'Blfrtip',
//         buttons: [      
//             {
//                 extend: 'excelHtml5',
//                 title: 'Excel MK',
//                 text:'Export to Excel' 
//             },
//             {
//                 extend: 'csvHtml5',
//                 title: 'CSV MK',                    
//                 text: 'Export to CSV' 
//             },
//             {
//                 extend: 'pdfHtml5',
//                 title: 'PDF MK',
//                 className: 'btn_pdf',
//                 text: 'Export to PDF' 
//             },
//        ]	        
//     });
    
//     $('.btn_pdf').attr("class","btn btn-success");

// } );

function htmlToPdf(){
    var doc = new jsPDF('p', 'pt', 'letter');
    var htmlstring = '';
    var tempVarToCheckPageHeight = 0;
    var pageHeight = 0;
    pageHeight = doc.internal.pageSize.height;
    specialElementHandlers = {
        // element with id of "bypass" - jQuery style selector  
        '#bypassme': function (element, renderer) {
            // true = "handled elsewhere, bypass text extraction"  
            return true
        }
    };
    margins = {
        top: 150,
        bottom: 60,
        left: 40,
        right: 40,
        width: 600
    };
    var y = 20;
    
    doc.setLineWidth(2);
    doc.text(250, y = y + 30, "Orders of JnJ");
    doc.autoTable({
        html: '#example',
        startY: 70,
        theme: 'grid',
        columnStyles: {
            0: {
                cellWidth: 90,
            },
            1: {
                cellWidth: 90,
            },
            2: {
                cellWidth: 90,
            },
            3: {
                cellWidth: 90,
            },
            4: {
                cellWidth: 90,
            }
        },
        styles: {
            minCellHeight: 40
        },
        specialElementHandlers: specialElementHandlers
    })
    doc.save('Orders.pdf');
}

function htmlToExcel(){
    // TableToExcel.convert(document.getElementById("example"));
    TableToExcel.convert(document.getElementById("example"), {
        name: "orders.xlsx",
        sheet: {
          name: "Sheet 1"
        }
      });
}