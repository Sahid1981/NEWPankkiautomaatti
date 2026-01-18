#include "logs.h"
#include "logevents.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

logs::logs(QObject *parent) : QObject(parent) {
    tableModel = new QStandardItemModel(this);
    tableModel->setRowCount(0);
    tableModel->setColumnCount(2);
    tableModel->setHorizontalHeaderLabels({"Aika", "Muutos"});
}

void logs::setLog(const QByteArray &newLog)
{
    logArray = newLog;
    QJsonDocument json_doc = QJsonDocument::fromJson(logArray);
    QJsonArray json_array=json_doc.array();

    QVector<logevents> loglist;
    for (const QJsonValue &value : json_array) {
        //jsonista c++ objektiksi
        if (value.isObject()) {
            logevents logev = logevents::mapJson(value.toObject());
            loglist.append(logev);
        }
    }
    //nollataan varmuuden vuoksi
    tableModel->setRowCount(0);

    for (int row = 0; row < loglist.size(); row ++) {
        //ja QStandarditemiin
        const logevents &event = loglist[row];
        QStandardItem *aika = new QStandardItem(event.time);
        aika->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        QStandardItem *muutos = new QStandardItem(QString::asprintf("%.2f €", event.balancechange));
        muutos->setTextAlignment(Qt::AlignRight | Qt::AlignVCenter);
        tableModel->appendRow({aika, muutos});
    }

}
