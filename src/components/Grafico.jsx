import React, { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";

function Grafico() {
    const [data, setData] = useState([
        ["Task", "Scontri"],
        ["Da Giocare", 0],
        ["Giocate", 0],
    ]);

    useEffect(() => {

        const handleStorageChange = () => {
            const scontri = JSON.parse(sessionStorage.getItem('scontri')) || [];
            const scontriDaGiocare = scontri.filter(scontro => scontro.winnerId === null || scontro.winnerId === undefined);
            const scontriGiocati = scontri.filter(scontro => scontro.winnerId !== null && scontro.winnerId !== undefined);

            setData([
                ["Task", "Scontri"],
                ["Da Giocare", scontriDaGiocare.length],
                ["Giocate", scontriGiocati.length],
            ]);
        }

        window.addEventListener('StorageScontriUpdate', handleStorageChange);

        return () => {
            window.removeEventListener('StorageScontriUpdate', handleStorageChange);
        }
    }, []);

    const lightGreen = "#B5C99A";
    const darkGreen = "#E9F5DB";
    const textColor = "black";

    const options = {
        is3D: true, // Enables 3D view
        pieStartAngle: 0, // Rotates the chart
        backgroundColor: 'transparent',
        width: "100%",
        height: "100%",
        legend: {
            position: "bottom",
            alignment: "center",
            textStyle: {
                color: textColor,
                fontSize: 14,
            },
        },
        pieSliceTextStyle: {
            color: textColor, // Sets the text displaying the percentage to black
        },
        colors: [darkGreen, lightGreen], // Sets the colors of the slices
    };

    return (
        <div className="border-2 border-secondary rounded-lg p-5">
            <Chart
              chartType="PieChart"
              data={data}
              options={options}
            />
        </div>
    );
}

export default Grafico;