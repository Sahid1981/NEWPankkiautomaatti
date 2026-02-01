#include "carddata.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

carddata::carddata(QObject *parent) : QObject(parent){
    tableModel = new QStandardItemModel(this);
    tableModel->setRowCount(0);
    tableModel->setColumnCount(4);
    tableModel->setHorizontalHeaderLabels({"KortinID", "PIN", "KayttäjäID", "Lukossa"});
}

void carddata::setCardData(const QByteArray &newCardData)
{
    cardDataList.clear();
    cardDataArray = newCardData;
    QJsonDocument json_doc = QJsonDocument::fromJson(cardDataArray);
    QJsonArray json_array=json_doc.array();

    //QVector<card> loglist;
    for (const QJsonValue &value : json_array) {
        //jsonista c++ objektiksi
        if (value.isObject()) {
            card cardData = card::mapJson(value.toObject());
            cardDataList.append(cardData);
        }
    }
    //nollataan varmuuden vuoksi
    tableModel->setRowCount(0);

    updateModel();
}

void carddata::updateModel()
{
    //tyhjennetään ensin
    tableModel->removeRows(0, tableModel->rowCount());

    for (int row = 0; row < cardDataList.size(); row++) {
        const card &card = cardDataList[row];
        QStandardItem *idCardItem = new QStandardItem(card.idcard);
        idCardItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row, 0, idCardItem );
        QStandardItem *PINItem = new QStandardItem(card.cardPIN);
        PINItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row, 1, PINItem);
        QStandardItem *idUserItem = new QStandardItem(card.iduser);
        idUserItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row, 2 , idUserItem);
        QString islockedString = card.is_locked ? "True" : "False";
        QStandardItem *lockedItem = new QStandardItem(islockedString);
        lockedItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row, 3, lockedItem);
    }
}


