/**
  * @file This module provides quick validation of an objects structure.
  * ALlowing the rest of the program to quickly ensure it's able to work with the data
  * provided by remote servers.
  */

const Joi = require("joi");

const active_directory = Joi.array().items(
  Joi.object().keys({
    "GivenName": Joi.string().required(),
    "Surname": Joi.string().required(),
    "Enabled": Joi.boolean().required(),
    "SamAccountName": Joi.string().required()
  }).unknown(true)
);

const powerschool = Joi.array().items(
  Joi.object().keys({
    details: Joi.object().keys({
      staffs: Joi.object().keys({
        staff: Joi.array().items(
          Joi.object().keys({
            users_dcid: Joi.number().integer().required(),
            local_id: Joi.any().required(),
            name: Joi.object().keys({
              first_name: Joi.string().required(),
              last_name: Joi.string().required()
            }).unknown(true)
          }).unknown(true)
        )
      }).unknown(true)
    }).unknown(true),
    count: Joi.number().required(),
    schoolName: Joi.any().required(),
    schoolID: Joi.any().optional()
  })
);

module.exports = {
  active_directory,
  powerschool,
};
