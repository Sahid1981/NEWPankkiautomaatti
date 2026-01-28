#include "userdata.h"
#include "user.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

userdata::userdata(QObject *parent) : QObject(parent) {
    tableModel = new QStandardItemModel(this);
    tableModel->setRowCount(0);
    tableModel->setColumnCount(4);
    tableModel->setHorizontalHeaderLabels({"KäyttäjäID", "Etunimi", "Sukunimi", "Osoite"});
}

void userdata::setUserData(const QByteArray &newUserData)
{
    userDataList.clear();
    userDataArray = newUserData;
    QJsonDocument json_doc = QJsonDocument::fromJson(userDataArray);
    QJsonArray json_array=json_doc.array();

    //QVector<user> loglist;
    for (const QJsonValue &value : json_array) {
        //jsonista c++ objektiksi
        if (value.isObject()) {
            user userData = user::mapJson(value.toObject());
            userDataList.append(userData);
        }
    }
    //nollataan varmuuden vuoksi
    tableModel->setRowCount(0);

    updateModel();
}

void userdata::updateModel()
{
    //tyhjennetään ensin
    tableModel->removeRows(0, tableModel->rowCount());

    for (int row = 0; row < userDataList.size(); row++) {
        const user &user = userDataList[row];
        QStandardItem *idUserItem = new QStandardItem(user.iduser);
        idUserItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row,0, idUserItem);
        QStandardItem *fNameItem = new QStandardItem(user.fname);
        fNameItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row,1, fNameItem);
        QStandardItem *lNameItem = new QStandardItem(user.lname);
        lNameItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row,2, lNameItem);
        QStandardItem *addressItem = new QStandardItem(user.streetaddress);
        addressItem->setTextAlignment(Qt::AlignCenter | Qt::AlignVCenter);
        tableModel->setItem(row,3, addressItem);
    }
}
