class ScoreTable {
    constructor() {
        this.table = JSON.parse(getItem('table')) || [];
    }

    get() {
        this.table.sort(function (a, b) {
            return b[2] - a[2];
        });

        let content = "";
        for (let n = 0; n < this.table.length; n++) {
            content += "<tr><td>" + this.table[n][0] + "</td>" + "<td>" + this.table[n][1] + "</td>" + "<td>" + this.table[n][2] + "</td></tr>";
        }
        return content;
    }

    add(name, data) {
        const date = new Date();
        const time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        this.table.push([time, name, data]);
        setItem("table", JSON.stringify(this.table));
    }


}