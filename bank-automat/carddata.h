#ifndef CARDDATA_H
#define CARDDATA_H

#include "card.h"
#include <QObject>
#include <QVector>
#include <QStandardItemModel>

class carddata : public QObject
{
    Q_OBJECT
public:
    explicit carddata(QObject * parent = nullptr);
    void setCardData(const QByteArray &newCardData);
    QStandardItemModel* getModel() const {return tableModel;};

    void updateModel();

private:
    QByteArray cardDataArray;
    QVector<card> cardDataList;
    QStandardItemModel *tableModel;
};

#endif // CARDDATA_H
